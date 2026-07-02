/**
 * Research assistant agent — built with the Anthropic SDK directly,
 * the way a typical customer would build it before adopting Verlon.
 *
 * Three call sites (each becomes a Verlon "gate" later):
 *   1. ORCHESTRATOR — picks which specialist handles the question.
 *      Declares one tool: route(action: 'quick' | 'search').
 *   2. QUICK ANSWER — answers from training knowledge, no tools.
 *   3. SEARCHER — answers using a real Brave web_search tool. Two-step:
 *      first call returns the search query, we run the search locally,
 *      then we feed the results back for synthesis.
 *
 * Run direct against Anthropic:
 *   pnpm research "What's the capital of Mongolia?"
 *
 * Run through Verlon (after the gates exist + IDs are in .env.local):
 *   USE_VERLON=true pnpm research "What did OpenAI announce last week?"
 *
 * The agent code itself does NOT change between the two modes — only
 * the SDK client init (in lib/anthropic-client.ts) and one extra
 * header per call. That diff is the entire "adopt Verlon" story.
 */
import { randomUUID } from 'node:crypto';
import type Anthropic from '@anthropic-ai/sdk';
import {
  buildAnthropicClient,
  verlonHeaders,
} from '../lib/anthropic-client.js';
import { braveSearch } from '../lib/brave.js';

// Models — picked to give a meaningful cost spread across the three
// call sites (orchestrator + searcher = Sonnet, quick = Haiku).
const ORCHESTRATOR_MODEL = 'claude-sonnet-4-5';
const QUICK_MODEL = 'claude-haiku-4-5';
const SEARCHER_MODEL = 'claude-sonnet-4-5';

const MAX_TOKENS = 1024;

// ----------------------------------------------------------------------
// Orchestrator — picks the specialist via a tool call.
// ----------------------------------------------------------------------

const ROUTE_TOOL: Anthropic.Tool = {
  name: 'route',
  description:
    'Pick the specialist that should handle this user question. Use "quick" for factual questions answerable from general knowledge (capitals, definitions, math, well-established facts). Use "search" for questions about recent events, current state of the world, or anything time-sensitive.',
  input_schema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['quick', 'search'],
        description: 'Which specialist should handle this question.',
      },
      reasoning: {
        type: 'string',
        description: 'One short sentence explaining why this specialist.',
      },
    },
    required: ['action', 'reasoning'],
  },
};

interface RouteDecision {
  action: 'quick' | 'search';
  reasoning: string;
}

async function runOrchestrator(
  client: Anthropic,
  question: string,
  sessionId: string
): Promise<RouteDecision> {
  const res = await client.messages.create(
    {
      model: ORCHESTRATOR_MODEL,
      max_tokens: 256,
      system:
        'You are the router for a research assistant. For each user question, decide which specialist should answer: the quick-answer specialist (no tools, fast) for factual general-knowledge questions, or the searcher specialist (web search) for time-sensitive or recent-events questions. Always call the route tool — do not respond with text.',
      messages: [{ role: 'user', content: question }],
      tools: [ROUTE_TOOL],
      tool_choice: { type: 'tool', name: 'route' },
    },
    {
      headers: verlonHeaders({
        gateIdEnvVar: 'RESEARCH_ORCHESTRATOR_GATE_ID',
        sessionId,
      }),
    }
  );

  const toolUse = res.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Orchestrator did not emit a tool call');
  }
  return toolUse.input as RouteDecision;
}

// ----------------------------------------------------------------------
// Quick answer specialist — no tools, just synthesizes.
// ----------------------------------------------------------------------

async function runQuickAnswer(
  client: Anthropic,
  question: string,
  sessionId: string
): Promise<string> {
  const res = await client.messages.create(
    {
      model: QUICK_MODEL,
      max_tokens: MAX_TOKENS,
      system:
        'You are a concise research assistant. Answer the question in 1-3 sentences using your general knowledge. If you do not know, say so plainly.',
      messages: [{ role: 'user', content: question }],
    },
    {
      headers: verlonHeaders({
        gateIdEnvVar: 'RESEARCH_QUICK_ANSWER_GATE_ID',
        sessionId,
      }),
    }
  );
  return extractText(res);
}

// ----------------------------------------------------------------------
// Searcher specialist — declares the web_search tool, runs Brave for
// the model's chosen query, then synthesizes a final answer.
// ----------------------------------------------------------------------

const WEB_SEARCH_TOOL: Anthropic.Tool = {
  name: 'web_search',
  description:
    'Search the web for current information. Use a focused query — short and specific. Returns up to 5 result snippets.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query. Focused, 1-10 words.',
      },
    },
    required: ['query'],
  },
};

const SEARCHER_SYSTEM = [
  'You are a research specialist with access to a real web search tool.',
  'For any question requiring current or time-sensitive information, call the web_search tool with a focused query.',
  'After the tool returns results, synthesize a clear answer that cites specific sources by URL. Be concrete; do not over-hedge.',
].join(' ');

// Cap the agentic loop so a model that won't stop calling web_search
// can't burn budget indefinitely. 5 rounds is generous for research.
const MAX_SEARCH_ROUNDS = 5;

async function runSearcher(
  client: Anthropic,
  question: string,
  sessionId: string
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  for (let round = 0; round < MAX_SEARCH_ROUNDS; round++) {
    const res = await client.messages.create(
      {
        model: SEARCHER_MODEL,
        max_tokens: MAX_TOKENS,
        system: SEARCHER_SYSTEM,
        messages,
        tools: [WEB_SEARCH_TOOL],
      },
      {
        headers: verlonHeaders({
          gateIdEnvVar: 'RESEARCH_SEARCHER_GATE_ID',
          sessionId,
        }),
      }
    );

    const toolUses = res.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    );

    if (toolUses.length === 0) {
      // Model returned text-only — synthesis complete.
      return extractText(res);
    }

    // Run every tool_use the model emitted this round, then feed the
    // results back as a single user turn.
    messages.push({ role: 'assistant', content: res.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      const { query } = tu.input as { query: string };
      console.log(`    [searcher] Brave query: "${query}"`);
      const results = await braveSearch(query);
      const block = results
        .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.snippet}`)
        .join('\n\n');
      toolResults.push({
        type: 'tool_result',
        tool_use_id: tu.id,
        content: block,
      });
    }
    messages.push({ role: 'user', content: toolResults });
  }

  // Hit the cap — force a no-tool synthesis from what we have so the
  // user always gets *something* back instead of an exception.
  console.log(
    `    [searcher] reached MAX_SEARCH_ROUNDS=${MAX_SEARCH_ROUNDS}, forcing synthesis`
  );
  const final = await client.messages.create(
    {
      model: SEARCHER_MODEL,
      max_tokens: MAX_TOKENS,
      system: `${SEARCHER_SYSTEM} You have exhausted your tool budget — synthesize a final answer now from the search results already gathered. Do NOT call any tools.`,
      messages,
    },
    {
      headers: verlonHeaders({
        gateIdEnvVar: 'RESEARCH_SEARCHER_GATE_ID',
        sessionId,
      }),
    }
  );
  return extractText(final);
}

// ----------------------------------------------------------------------
// Top-level loop — orchestrate one user question.
// ----------------------------------------------------------------------

interface SessionResult {
  sessionId: string;
  decision: RouteDecision;
  answer: string;
}

export async function answerOne(
  question: string,
  // Optional — pass an explicit sessionId so a multi-turn simulator
  // can roll several questions up under one Verlon agent_session.
  sessionIdArg?: string
): Promise<SessionResult> {
  const client = buildAnthropicClient();
  const sessionId = sessionIdArg ?? randomUUID();
  const useVerlon = process.env.USE_VERLON === 'true';
  console.log(
    `\n=== research session ${sessionId.slice(0, 8)} ${useVerlon ? '(via Verlon)' : '(direct Anthropic)'} ===`
  );
  console.log(`Q: ${question}`);

  const decision = await runOrchestrator(client, question, sessionId);
  console.log(`  [router] action=${decision.action} — ${decision.reasoning}`);

  let answer: string;
  if (decision.action === 'quick') {
    answer = await runQuickAnswer(client, question, sessionId);
  } else {
    answer = await runSearcher(client, question, sessionId);
  }

  console.log(`A: ${answer}\n`);
  return { sessionId, decision, answer };
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function extractText(res: Anthropic.Message): string {
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
  return text || '(no text returned)';
}

// ----------------------------------------------------------------------
// CLI — only fire when this file is the entry point. Importing
// `answerOne` from a sibling script (e.g. simulate-research-sessions)
// must NOT trigger the CLI.
// ----------------------------------------------------------------------

const isEntry = import.meta.url === `file://${process.argv[1]}`;
if (isEntry) {
  const question = process.argv.slice(2).join(' ').trim();
  if (!question) {
    console.error('Usage: pnpm research "your question here"');
    process.exit(1);
  }
  answerOne(question).catch((err) => {
    console.error('Crashed:', err);
    process.exit(1);
  });
}
