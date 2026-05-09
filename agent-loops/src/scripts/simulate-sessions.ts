/**
 * Multi-turn session simulator for the customer-support agent.
 *
 * Exercises:
 *   - Multiple sessions with distinct sessionId values
 *   - Multiple turns per session with the SAME sessionId (Layer should
 *     roll all turn requests up under one agent_session)
 *   - Per-turn classifier routing — a single session can pivot from
 *     billing → technical → general, each turn hitting a different
 *     sub-gate of agent-support
 *   - Conversation history threaded through every specialist call so
 *     the model can reference prior turns
 *
 * Run via Layer (USE_LAYER=true in .env.local):
 *   pnpm simulate
 */
import { randomUUID } from 'node:crypto';
import type OpenAI from 'openai';
import { buildOpenAIClient, layerHeaders } from '../lib/openai-client.js';

const CLASSIFIER_MODEL = 'gpt-4o-mini';
const SPECIALIST_MODEL = 'gpt-4o';
const MAX_TOKENS = 1024;

// ----------------------------------------------------------------------
// Gate routing — mirrors customer-support.ts.
// ----------------------------------------------------------------------

type Specialist = 'billing' | 'technical' | 'general';

const SPECIALIST_GATE_ENV: Record<Specialist, string> = {
  billing: 'SUPPORT_BILLING_GATE_ID',
  technical: 'SUPPORT_TECHNICAL_GATE_ID',
  general: 'SUPPORT_GENERAL_GATE_ID',
};

const SPECIALIST_SYSTEMS: Record<Specialist, string> = {
  billing:
    'You are a billing specialist for a SaaS product. Answer the customer in 2-4 sentences. Reference earlier turns of the conversation when relevant. If you need data you do not have (account ID, invoice number), ask for it explicitly.',
  technical:
    'You are a technical-support specialist for a SaaS product with a developer API. Answer the customer in 2-5 sentences. Reference earlier turns of the conversation when relevant. If the question implies a code bug, ask for a minimal repro.',
  general:
    'You are a general-purpose customer-support specialist. Answer the customer in 1-3 sentences. Reference earlier turns of the conversation when relevant. Route them to a specialist (billing / technical) when their actual concern is one of those.',
};

const CLASSIFY_TOOL: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'route_ticket',
    description:
      'Pick the specialist that should handle the latest customer message. Use "billing" for invoice / refund / subscription, "technical" for bugs / setup / API / integration, "general" for everything else.',
    parameters: {
      type: 'object',
      properties: {
        specialist: {
          type: 'string',
          enum: ['billing', 'technical', 'general'],
        },
        reasoning: {
          type: 'string',
          description: 'One short sentence explaining the choice.',
        },
      },
      required: ['specialist', 'reasoning'],
    },
  },
};

// ----------------------------------------------------------------------
// One scenario = one session = ordered list of user turns.
// ----------------------------------------------------------------------

interface Scenario {
  name: string;
  turns: string[];
}

const SCENARIOS: Scenario[] = [
  {
    // Designed to pivot mid-session — billing question, then a
    // technical follow-up, then a general thank-you. The classifier
    // should route each turn to a different specialist.
    name: 'pivoting customer',
    turns: [
      "Hi — I noticed I haven't been charged for last month. When does my renewal hit?",
      "Got it, thanks. Separate question: my SDK keeps timing out on completions over 20 seconds. We're using the Node SDK on Railway. Any common cause?",
      'Great, will try that. Last thing — do I need to update my email preferences anywhere to stop getting product newsletters?',
    ],
  },
  {
    // Designed to stay in one specialist all session — a multi-turn
    // technical debugging conversation. Tests that the specialist
    // sees prior turns and references them.
    name: 'technical deep dive',
    turns: [
      'My API calls are returning 429 rate-limit errors after just a few requests. We just upgraded to the Growth tier yesterday.',
      'The errors are coming from our background worker which fans out 10 requests at a time. Could that be the issue?',
      'OK so the per-minute limit is the cap, not concurrent connections. What\'s the right pattern — should I add a token bucket on our side or rely on backoff?',
    ],
  },
];

interface Turn {
  user: string;
  specialist: Specialist;
  reasoning: string;
  assistant: string;
}

interface SessionRecord {
  scenario: string;
  sessionId: string;
  turns: Turn[];
}

async function runScenario(
  client: OpenAI,
  scenario: Scenario
): Promise<SessionRecord> {
  const sessionId = randomUUID();
  console.log(
    `\n=== session ${sessionId.slice(0, 8)} — "${scenario.name}" (${scenario.turns.length} turns) ===`
  );

  // Threaded history. Classifier sees the full transcript so it can
  // judge "is THIS turn's topic the same as before?". Specialist also
  // sees the full transcript so it can respond in context.
  const history: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  const turns: Turn[] = [];

  for (let i = 0; i < scenario.turns.length; i++) {
    const userText = scenario.turns[i];
    history.push({ role: 'user', content: userText });
    console.log(`\n[turn ${i + 1}] user: ${userText}`);

    // Classifier — call goes to AGENT_SUPPORT_GATE_ID so the agent
    // gate opens the session on turn 1 and joins it on subsequent
    // turns. Same sessionId throughout.
    const classifyRes = await client.chat.completions.create(
      {
        model: CLASSIFIER_MODEL,
        max_tokens: 256,
        messages: [
          {
            role: 'system',
            content:
              'You are the router for a customer-support agent. Look at the latest user message in context of the conversation history and pick which specialist should answer. Always call the route_ticket function.',
          },
          ...history,
        ],
        tools: [CLASSIFY_TOOL],
        tool_choice: { type: 'function', function: { name: 'route_ticket' } },
      },
      {
        headers: layerHeaders({
          gateIdEnvVar: 'AGENT_SUPPORT_GATE_ID',
          sessionId,
        }),
      }
    );

    const call = classifyRes.choices[0]?.message?.tool_calls?.[0];
    if (!call || call.type !== 'function') {
      throw new Error('Classifier did not emit a function call');
    }
    const decision = JSON.parse(call.function.arguments) as {
      specialist: Specialist;
      reasoning: string;
    };
    console.log(
      `  [classifier] specialist=${decision.specialist} — ${decision.reasoning}`
    );

    // Specialist — call goes to the chosen sub-gate, same sessionId.
    const specialistRes = await client.chat.completions.create(
      {
        model: SPECIALIST_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: SPECIALIST_SYSTEMS[decision.specialist] },
          ...history,
        ],
      },
      {
        headers: layerHeaders({
          gateIdEnvVar: SPECIALIST_GATE_ENV[decision.specialist],
          sessionId,
        }),
      }
    );

    const reply =
      specialistRes.choices[0]?.message?.content?.trim() ||
      '(no text returned)';
    history.push({ role: 'assistant', content: reply });
    console.log(`  [${decision.specialist}] ${reply}`);

    turns.push({
      user: userText,
      specialist: decision.specialist,
      reasoning: decision.reasoning,
      assistant: reply,
    });
  }

  return { scenario: scenario.name, sessionId, turns };
}

async function main() {
  const client = buildOpenAIClient();
  const useLayer = process.env.USE_LAYER === 'true';
  if (!useLayer) {
    console.log(
      '(USE_LAYER is not true — calls will hit OpenAI directly and the session-linking story will not be exercised.)'
    );
  }

  const records: SessionRecord[] = [];
  for (const scenario of SCENARIOS) {
    records.push(await runScenario(client, scenario));
  }

  console.log('\n\n=== summary ===');
  for (const r of records) {
    const path = r.turns.map((t) => t.specialist).join(' → ');
    console.log(
      `  ${r.scenario.padEnd(22)} session=${r.sessionId.slice(0, 8)}  path: ${path}`
    );
  }

  console.log(
    '\nVerify in DB:\n  psql -d layer_ai_dev -c "SELECT g.name, r.session_id, r.created_at FROM requests r JOIN gates g ON g.id = r.gate_id WHERE r.created_at > NOW() - INTERVAL \'5 minutes\' ORDER BY r.created_at;"\n'
  );
}

main().catch((err) => {
  console.error('Simulator crashed:', err);
  process.exit(1);
});
