/**
 * Multi-turn session simulator for the customer-support agent.
 *
 * Exercises:
 *   - Multiple sessions with distinct sessionId values
 *   - Multiple turns per session with the SAME sessionId (Verlon should
 *     roll all turn requests up under one agent_session)
 *   - Per-turn classifier routing — a single session can pivot from
 *     billing → technical → general, each turn hitting a different
 *     sub-gate of agent-support
 *   - Conversation history threaded through every specialist call so
 *     the model can reference prior turns
 *
 * Run via Verlon (USE_VERLON=true in .env.local):
 *   pnpm simulate
 */
import { randomUUID } from 'node:crypto';
import type OpenAI from 'openai';
import { buildOpenAIClient, verlonHeaders } from '../lib/openai-client.js';
import { generateNextUserTurn } from '../lib/user-simulator.js';
import {
  SUPPORT_SCENARIOS,
  type SupportScenario,
} from '../scenarios/support-scenarios.js';

const CLASSIFIER_MODEL = 'gpt-4o-mini';
const SPECIALIST_MODEL = 'gpt-4o';
const MAX_TOKENS = 1024;

// How long simulated sessions should run. The scripted scenarios
// usually cap at 2–3 turns; after that, the user-simulator generates
// plausible follow-ups until we hit TARGET_TURNS or the simulator
// signals the conversation is naturally complete. Override via env.
const TARGET_TURNS = Number(process.env.TARGET_TURNS || 20);

// Multiple passes through the SUPPORT_SCENARIOS list, each pass with
// fresh sessionIds so the same scenario can produce several distinct
// sessions. Default 2 → ~60 sessions across 30 scenarios.
const PASSES = Number(process.env.PASSES || 2);

const USER_PERSONA = {
  role: 'customer-support inbound',
  guidance:
    'You are a paying SaaS customer talking to support. You start with a real concern, ask follow-ups when answers raise new questions, and behave like a normal user (sometimes grateful, sometimes frustrated, sometimes confused). When everything you came for has been answered and a real person would just say "thanks, that\'s all," set shouldContinue=false.',
};

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
// Scenarios live in src/scenarios/support-scenarios.ts so the same
// curated set can be replayed by simulate-all.ts without duplication.
// ----------------------------------------------------------------------

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

async function runOneTurn(
  client: OpenAI,
  sessionId: string,
  userText: string,
  history: OpenAI.Chat.ChatCompletionMessageParam[],
  turnNumber: number
): Promise<Turn> {
  history.push({ role: 'user', content: userText });
  console.log(`\n[turn ${turnNumber}] user: ${userText}`);

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
      headers: verlonHeaders({
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
      headers: verlonHeaders({
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

  return {
    user: userText,
    specialist: decision.specialist,
    reasoning: decision.reasoning,
    assistant: reply,
  };
}

async function runScenario(
  client: OpenAI,
  scenario: SupportScenario
): Promise<SessionRecord> {
  const sessionId = randomUUID();
  console.log(
    `\n=== session ${sessionId.slice(0, 8)} — "${scenario.name}" (target ${TARGET_TURNS} turns) ===`
  );

  // Threaded history. Classifier sees the full transcript so it can
  // judge "is THIS turn's topic the same as before?". Specialist also
  // sees the full transcript so it can respond in context.
  const history: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  const turns: Turn[] = [];

  // 1. Scripted turns from the curated scenario — these seed the
  // conversation with a coherent starting concern.
  for (let i = 0; i < scenario.turns.length; i++) {
    const turn = await runOneTurn(
      client,
      sessionId,
      scenario.turns[i],
      history,
      turns.length + 1
    );
    turns.push(turn);
  }

  // 2. Continuation — let the user-simulator drive plausible follow-up
  // turns until TARGET_TURNS or it signals the conversation is done.
  while (turns.length < TARGET_TURNS) {
    let next;
    try {
      next = await generateNextUserTurn(history, USER_PERSONA);
    } catch (err) {
      console.warn(
        `  [user-sim] failed to generate next turn — ending session early:`,
        err instanceof Error ? err.message : err
      );
      break;
    }
    const turn = await runOneTurn(
      client,
      sessionId,
      next.message,
      history,
      turns.length + 1
    );
    turns.push(turn);
    if (!next.shouldContinue) {
      console.log(`  [user-sim] signaled conversation complete`);
      break;
    }
  }

  return { scenario: scenario.name, sessionId, turns };
}

async function main() {
  const client = buildOpenAIClient();
  const useVerlon = process.env.USE_VERLON === 'true';
  if (!useVerlon) {
    console.log(
      '(USE_VERLON is not true — calls will hit OpenAI directly and the session-linking story will not be exercised.)'
    );
  }

  const records: SessionRecord[] = [];
  for (let pass = 1; pass <= PASSES; pass++) {
    console.log(`\n########## pass ${pass}/${PASSES} ##########\n`);
    for (const scenario of SUPPORT_SCENARIOS) {
      records.push(await runScenario(client, scenario));
    }
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
