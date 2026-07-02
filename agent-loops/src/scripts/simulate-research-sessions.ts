/**
 * Multi-turn session simulator for the research agent.
 *
 * Mirrors simulate-sessions.ts but for the research family of gates
 * (Anthropic SDK, agent-research orchestrator + quick-answer + searcher
 * sub-gates). Drives multiple user turns through one shared sessionId
 * so Verlon rolls every orchestrator + sub-gate call up under a single
 * agent_session.
 *
 * Each turn is a self-contained question — the research agent doesn't
 * thread conversation history through the orchestrator, so we don't
 * try to pretend it does. The point of this simulator is to verify
 * session-linked dispatch across the quick-answer / searcher sub-gates
 * within a single agent session.
 *
 * Run via Verlon:
 *   pnpm simulate-research
 */
import { randomUUID } from 'node:crypto';
import type OpenAI from 'openai';
import { answerOne } from '../agents/research.js';
import { generateNextUserTurn } from '../lib/user-simulator.js';
import {
  RESEARCH_SCENARIOS,
  type ResearchScenario,
} from '../scenarios/research-scenarios.js';

const TARGET_TURNS = Number(process.env.TARGET_TURNS || 20);
const PASSES = Number(process.env.PASSES || 2);

const USER_PERSONA = {
  role: 'researcher / curious investigator',
  guidance:
    'You are using a research assistant to dig into a topic. Each new question builds on what you just learned — drill into specifics, ask for clarifications, request comparisons or implications. Realistic research sessions branch out as new questions surface from earlier answers. When you have a satisfying understanding and a real person would stop, set shouldContinue=false.',
};

interface TurnRecord {
  question: string;
  action: 'quick' | 'search';
  reasoning: string;
}

interface SessionRecord {
  scenario: string;
  sessionId: string;
  turns: TurnRecord[];
}

async function runScenario(scenario: ResearchScenario): Promise<SessionRecord> {
  const sessionId = randomUUID();
  const turns: TurnRecord[] = [];
  // Tracked only for the user-simulator so it can write a plausible
  // next question grounded in prior answers. The research orchestrator
  // itself still sees each turn as a fresh question — by design.
  const simHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  console.log(
    `\n>>> session ${sessionId.slice(0, 8)} — "${scenario.name}" (target ${TARGET_TURNS} turns)\n`
  );

  // 1. Scripted scenario turns first.
  for (let i = 0; i < scenario.turns.length; i++) {
    const question = scenario.turns[i];
    console.log(`--- turn ${turns.length + 1} ---`);
    const result = await answerOne(question, sessionId);
    turns.push({
      question,
      action: result.decision.action,
      reasoning: result.decision.reasoning,
    });
    simHistory.push({ role: 'user', content: question });
    simHistory.push({ role: 'assistant', content: result.answer });
  }

  // 2. Continuation — let the user-simulator drive follow-up questions
  // that build on what was just learned.
  while (turns.length < TARGET_TURNS) {
    let next;
    try {
      next = await generateNextUserTurn(simHistory, USER_PERSONA);
    } catch (err) {
      console.warn(
        `  [user-sim] failed to generate next turn — ending session early:`,
        err instanceof Error ? err.message : err
      );
      break;
    }
    console.log(`--- turn ${turns.length + 1} ---`);
    const result = await answerOne(next.message, sessionId);
    turns.push({
      question: next.message,
      action: result.decision.action,
      reasoning: result.decision.reasoning,
    });
    simHistory.push({ role: 'user', content: next.message });
    simHistory.push({ role: 'assistant', content: result.answer });
    if (!next.shouldContinue) {
      console.log(`  [user-sim] signaled conversation complete`);
      break;
    }
  }

  return { scenario: scenario.name, sessionId, turns };
}

async function main() {
  const useVerlon = process.env.USE_VERLON === 'true';
  if (!useVerlon) {
    console.log(
      '(USE_VERLON is not true — calls hit Anthropic directly, no session linking is exercised.)'
    );
  }

  const records: SessionRecord[] = [];
  for (let pass = 1; pass <= PASSES; pass++) {
    console.log(`\n########## pass ${pass}/${PASSES} ##########\n`);
    for (const scenario of RESEARCH_SCENARIOS) {
      records.push(await runScenario(scenario));
    }
  }

  console.log('\n\n=== summary ===');
  for (const r of records) {
    const path = r.turns.map((t) => t.action).join(' → ');
    console.log(
      `  ${r.scenario.padEnd(22)} session=${r.sessionId.slice(0, 8)}  path: ${path}`
    );
  }

  console.log(
    "\nVerify in DB:\n  psql -d layer_ai_dev -c \"SELECT g.name, r.session_id, r.created_at FROM requests r JOIN gates g ON g.id = r.gate_id WHERE r.created_at > NOW() - INTERVAL '5 minutes' ORDER BY r.created_at;\"\n"
  );
}

main().catch((err) => {
  console.error('Research simulator crashed:', err);
  process.exit(1);
});
