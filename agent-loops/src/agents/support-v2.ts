import Anthropic from '@anthropic-ai/sdk';
import { Verlon } from '@verlon-ai/sdk';

/**
 * Agent gates v2 end-to-end example: a support agent written with the
 * NATIVE Anthropic SDK, observed through Verlon's trace substrate.
 *
 * The entire Verlon integration is:
 *   1. `verlon.agent(...)` + one `agent.trace(...)` scope per run
 *   2. `fetch: verlon.instrumentFetch()` on the Anthropic client
 *   3. `defaultHeaders: task.headers()` to name each call site
 *   4. `verlon.tool(...)` around locally-executed tools
 *
 * What lands on ONE trace: every Claude call (observed at the gateway,
 * task-attributed), the wrapped lookup_order tool (reported, measured),
 * and the model-initiated check_shipping tool (evidenced from traffic).
 */

const VERLON_URL = process.env.VERLON_BASE_URL!;
const GATE_ID = process.env.SUPPORT_V2_GATE_ID!;

const verlon = new Verlon({
  apiKey: process.env.VERLON_API_KEY!,
  baseUrl: VERLON_URL,
});
const support = verlon.agent(GATE_ID, 'support-agent-v2');
const classifyTask = support.task('classify');
const respondTask = support.task('respond');

// One client per call site — `clientOptions()` carries the Verlon
// base URL, the trace-aware fetch, and the task identity headers.
const classifier = new Anthropic({
  apiKey: process.env.VERLON_API_KEY!,
  ...classifyTask.clientOptions('anthropic'),
});
const responder = new Anthropic({
  apiKey: process.env.VERLON_API_KEY!,
  ...respondTask.clientOptions('anthropic'),
});

// Locally-executed tool the model never sees — wrapped, so it lands on
// the timeline as a measured (Reported) tool span.
const lookupOrder = verlon.tool('lookup_order', async (orderId: string) => {
  await new Promise((r) => setTimeout(r, 80)); // pretend DB latency
  return { orderId, status: 'shipped', carrier: 'DHL', eta: '2026-07-05' };
});

const SHIPPING_TOOL: Anthropic.Tool = {
  name: 'check_shipping',
  description:
    'Look up live shipping progress for a carrier tracking number.',
  input_schema: {
    type: 'object',
    properties: { carrier: { type: 'string' }, orderId: { type: 'string' } },
    required: ['carrier', 'orderId'],
  },
};

// Model-initiated tool executed by the loop — NOT wrapped, so Verlon
// only sees it in proxied traffic (Evidenced on the timeline).
function checkShipping(input: { carrier: string; orderId: string }) {
  return { inTransit: true, lastScan: 'Leipzig hub', daysLate: 1 };
}

async function handleTicket(message: string): Promise<string> {
  return support.trace({ conversationId: 'ticket_e2e_001' }, async (t) => {
    console.log('trace started:', t.traceId);

    const classification = await classifier.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 50,
      system:
        'Classify the support message. Reply with exactly one word: shipping, refund, or other.',
      messages: [{ role: 'user', content: message }],
    });
    const label =
      classification.content[0].type === 'text'
        ? classification.content[0].text.trim().toLowerCase()
        : 'other';
    console.log('classified as:', label);

    const order = await lookupOrder('ord_2214');
    console.log('order lookup (reported tool):', order.status);

    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: `Customer message (${label}): ${message}\nOrder record: ${JSON.stringify(order)}\nUse check_shipping if shipping progress matters, then answer in one sentence.`,
      },
    ];

    let response = await responder.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 300,
      tools: [SHIPPING_TOOL],
      messages,
    });

    // Standard Anthropic tool loop — tool results flow back through
    // the gateway, which is what makes the execution "evidenced".
    while (response.stop_reason === 'tool_use') {
      const toolUses = response.content.filter((b) => b.type === 'tool_use');
      console.log(
        'model requested tools (evidenced):',
        toolUses.map((b) => b.name).join(', ')
      );
      messages.push({ role: 'assistant', content: response.content });
      messages.push({
        role: 'user',
        content: toolUses.map((block) => ({
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: JSON.stringify(
            checkShipping(block.input as { carrier: string; orderId: string })
          ),
        })),
      });
      response = await responder.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 300,
        tools: [SHIPPING_TOOL],
        messages,
      });
    }

    const answer = response.content.find((b) => b.type === 'text');
    return answer?.type === 'text' ? answer.text : '(no text reply)';
  });
}

const reply = await handleTicket(
  "My order ord_2214 hasn't arrived and the tracking page looks stuck — where is it?"
);
console.log('agent reply:', reply);
await verlon.flushTelemetry();
console.log('telemetry flushed — check the trace on the dashboard');
