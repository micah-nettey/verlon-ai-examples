/**
 * Multi-turn session simulator for the research agent.
 *
 * Mirrors simulate-sessions.ts but for the research family of gates
 * (Anthropic SDK, agent-research orchestrator + quick-answer + searcher
 * sub-gates). Drives multiple user turns through one shared sessionId
 * so Layer rolls every orchestrator + sub-gate call up under a single
 * agent_session.
 *
 * Each turn is a self-contained question — the research agent doesn't
 * thread conversation history through the orchestrator, so we don't
 * try to pretend it does. The point of this simulator is to verify
 * session-linked dispatch across the quick-answer / searcher sub-gates
 * within a single agent session.
 *
 * Run via Layer:
 *   pnpm simulate-research
 */
import { randomUUID } from 'node:crypto';
import { answerOne } from '../agents/research.js';
import {
  RESEARCH_SCENARIOS,
  type ResearchScenario,
} from '../scenarios/research-scenarios.js';

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

  console.log(
    `\n>>> session ${sessionId.slice(0, 8)} — "${scenario.name}" (${scenario.turns.length} turns)\n`
  );

  for (let i = 0; i < scenario.turns.length; i++) {
    console.log(`--- turn ${i + 1}/${scenario.turns.length} ---`);
    const result = await answerOne(scenario.turns[i], sessionId);
    turns.push({
      question: scenario.turns[i],
      action: result.decision.action,
      reasoning: result.decision.reasoning,
    });
  }

  return { scenario: scenario.name, sessionId, turns };
}

async function main() {
  const useLayer = process.env.USE_LAYER === 'true';
  if (!useLayer) {
    console.log(
      '(USE_LAYER is not true — calls hit Anthropic directly, no session linking is exercised.)'
    );
  }

  const records: SessionRecord[] = [];
  for (const scenario of RESEARCH_SCENARIOS) {
    records.push(await runScenario(scenario));
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
