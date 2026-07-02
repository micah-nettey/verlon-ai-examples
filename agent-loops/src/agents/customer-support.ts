/**
 * Customer-support agent — built with the OpenAI SDK directly. Mirrors
 * the research agent's "orchestrator + specialists" shape, but uses
 * OpenAI's Chat Completions API instead of Anthropic Messages.
 *
 * Four call sites (each becomes a Layer "gate"):
 *   1. AGENT_SUPPORT    — the agent gate itself doubles as the
 *                         classifier/router (cheap model + a single
 *                         function-call to pick a specialist).
 *   2. BILLING_AGENT    — handles invoice / refund / subscription Qs.
 *   3. TECHNICAL_AGENT  — handles bugs / setup / API integration Qs.
 *   4. GENERAL_AGENT    — fallback for everything else.
 *
 * Run direct against OpenAI:
 *   pnpm support "I was charged twice for last month's invoice"
 *
 * Run through Layer (after gates exist + IDs are in .env.local):
 *   USE_LAYER=true pnpm support "..."
 */
import { randomUUID } from 'node:crypto';
import type OpenAI from 'openai';
import { buildOpenAIClient, layerHeaders } from '../lib/openai-client.js';

const CLASSIFIER_MODEL = 'gpt-4o-mini';
const SPECIALIST_MODEL = 'gpt-4o';

const MAX_TOKENS = 1024;

// ----------------------------------------------------------------------
// Classifier — single function-call to pick a specialist.
// ----------------------------------------------------------------------

const CLASSIFY_TOOL: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'route_ticket',
    description:
      'Pick the specialist that should handle this support ticket. Use "billing" for invoice / refund / subscription questions, "technical" for bugs / setup / API / integration questions, "general" for everything else.',
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

type Specialist = 'billing' | 'technical' | 'general';

interface RouteDecision {
  specialist: Specialist;
  reasoning: string;
}

async function runClassifier(
  client: OpenAI,
  ticket: string,
  sessionId: string
): Promise<RouteDecision> {
  const res = await client.chat.completions.create(
    {
      model: CLASSIFIER_MODEL,
      max_tokens: 256,
      messages: [
        {
          role: 'system',
          content:
            'You are the router for a customer-support agent. For each incoming ticket, decide which specialist should handle it. Always call the route_ticket function — do not respond with text.',
        },
        { role: 'user', content: ticket },
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

  const call = res.choices[0]?.message?.tool_calls?.[0];
  if (!call || call.type !== 'function') {
    throw new Error('Classifier did not emit a function call');
  }
  return JSON.parse(call.function.arguments) as RouteDecision;
}

// ----------------------------------------------------------------------
// Specialists — three flavors, all single-shot text replies.
// ----------------------------------------------------------------------

const SPECIALIST_SYSTEMS: Record<Specialist, string> = {
  billing:
    'You are a billing specialist for a SaaS product. Answer the customer in 2-4 sentences. Be concrete about timelines (e.g. "refunds take 5-7 business days"). If you need data you do not have (account ID, invoice number), ask for it explicitly.',
  technical:
    'You are a technical-support specialist for a SaaS product with a developer API. Answer the customer in 2-5 sentences. Reference docs URLs when helpful. If the question implies a code bug, ask for a minimal repro.',
  general:
    'You are a general-purpose customer-support specialist. Answer the customer in 1-3 sentences. Route them to a specialist (billing / technical) when their actual concern is one of those.',
};

const SPECIALIST_GATE_ENV: Record<Specialist, string> = {
  billing: 'SUPPORT_BILLING_GATE_ID',
  technical: 'SUPPORT_TECHNICAL_GATE_ID',
  general: 'SUPPORT_GENERAL_GATE_ID',
};

async function runSpecialist(
  client: OpenAI,
  specialist: Specialist,
  ticket: string,
  sessionId: string
): Promise<string> {
  const res = await client.chat.completions.create(
    {
      model: SPECIALIST_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: SPECIALIST_SYSTEMS[specialist] },
        { role: 'user', content: ticket },
      ],
    },
    {
      headers: layerHeaders({
        gateIdEnvVar: SPECIALIST_GATE_ENV[specialist],
        sessionId,
      }),
    }
  );
  return res.choices[0]?.message?.content?.trim() || '(no text returned)';
}

// ----------------------------------------------------------------------
// Top-level loop.
// ----------------------------------------------------------------------

interface SessionResult {
  sessionId: string;
  decision: RouteDecision;
  answer: string;
}

export async function answerOne(ticket: string): Promise<SessionResult> {
  const client = buildOpenAIClient();
  const sessionId = randomUUID();
  const useLayer = process.env.USE_LAYER === 'true';
  console.log(
    `\n=== support session ${sessionId.slice(0, 8)} ${useLayer ? '(via Layer)' : '(direct OpenAI)'} ===`
  );
  console.log(`Ticket: ${ticket}`);

  const decision = await runClassifier(client, ticket, sessionId);
  console.log(
    `  [classifier] specialist=${decision.specialist} — ${decision.reasoning}`
  );

  const answer = await runSpecialist(
    client,
    decision.specialist,
    ticket,
    sessionId
  );
  console.log(`Reply: ${answer}\n`);
  return { sessionId, decision, answer };
}

// ----------------------------------------------------------------------
// CLI
// ----------------------------------------------------------------------

const ticket = process.argv.slice(2).join(' ').trim();
if (!ticket) {
  console.error('Usage: pnpm support "ticket text here"');
  process.exit(1);
}
answerOne(ticket).catch((err) => {
  console.error('Crashed:', err);
  process.exit(1);
});
