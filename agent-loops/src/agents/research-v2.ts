import OpenAI from 'openai';
import { Verlon } from '@verlon-ai/sdk';
import { braveSearch } from '../lib/brave.js';

/**
 * Agent gates v2 example #2: a research agent that exercises the parts
 * support-v2 doesn't —
 *
 *   - the OpenAI SDK (via `task.clientOptions()`) instead of Anthropic
 *   - PARALLEL tool execution (three searches in Promise.all), which
 *     shows up as overlapping tool spans on the trace waterfall and
 *     must not confuse the coverage math
 *   - a NESTED SUB-AGENT: the summarizer is its own agent gate whose
 *     trace scope opens inside the orchestrator's, so it lands as an
 *     agent span in the SAME trace
 *   - gate-resolved model selection: the summarizer client puts its
 *     gate ID in the `model` field, so the gate decides which model
 *     serves the call
 */

const verlon = new Verlon({
  apiKey: process.env.VERLON_API_KEY!,
  baseUrl: process.env.VERLON_BASE_URL!,
});

const orchestrator = verlon.agent(
  process.env.RESEARCH_ORCH_GATE_ID!,
  'research-orchestrator-v2'
);
const planTask = orchestrator.task('plan');
const synthesizeTask = orchestrator.task('synthesize');

const summarizer = verlon.agent(
  process.env.RESEARCH_SUM_GATE_ID!,
  'research-summarizer-v2'
);
const summarizeTask = summarizer.task('summarize');

const planner = new OpenAI({
  apiKey: process.env.VERLON_API_KEY!,
  ...planTask.clientOptions('openai'),
});
const synthesizer = new OpenAI({
  apiKey: process.env.VERLON_API_KEY!,
  ...synthesizeTask.clientOptions('openai'),
});
const condenser = new OpenAI({
  apiKey: process.env.VERLON_API_KEY!,
  ...summarizeTask.clientOptions('openai'),
});

const webSearch = verlon.tool('web_search', async (query: string) => {
  const results = await braveSearch(query, 3);
  return results.map((r) => ({ title: r.title, snippet: r.snippet }));
});

async function research(question: string): Promise<string> {
  return orchestrator.trace({ conversationId: 'research_prod_001' }, async (t) => {
    console.log('trace:', t.traceId);

    const plan = await planner.chat.completions.create({
      model: 'gpt-5.2-mini',
      messages: [
        {
          role: 'user',
          content: `Give exactly three short web search queries (one per line, no numbering) to answer: ${question}`,
        },
      ],
    });
    const queries = (plan.choices[0].message.content ?? '')
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean)
      .slice(0, 3);
    console.log('queries:', queries.join(' | '));

    // Parallel tools — three overlapping tool spans on the waterfall.
    const searchResults = await Promise.all(queries.map((q) => webSearch(q)));

    // Nested sub-agent: its own gate, its own tasks, same trace.
    const summary = await summarizer.trace(async () => {
      const condensed = await condenser.chat.completions.create({
        model: process.env.RESEARCH_SUM_GATE_ID!,
        messages: [
          {
            role: 'user',
            content: `Condense these search results into five bullet points:\n${JSON.stringify(searchResults).slice(0, 6000)}`,
          },
        ],
      });
      return condensed.choices[0].message.content ?? '';
    });

    const answer = await synthesizer.chat.completions.create({
      model: 'gpt-5.2-mini',
      messages: [
        {
          role: 'user',
          content: `Question: ${question}\nResearch summary:\n${summary}\nAnswer in two sentences.`,
        },
      ],
    });
    return answer.choices[0].message.content ?? '(no answer)';
  });
}

const answer = await research(
  'What are the tradeoffs between OpenTelemetry spans and flat event logs for observing AI agents?'
);
console.log('answer:', answer);
await verlon.flushTelemetry();
console.log('done');
