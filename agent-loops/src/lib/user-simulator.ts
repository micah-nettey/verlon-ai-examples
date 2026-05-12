/**
 * Drives multi-turn conversations past their scripted scenarios.
 *
 * The hand-written scenarios cap out at 2–3 turns. To simulate real
 * production sessions (which routinely run 10–20+ turns), we let an
 * LLM play the "user" role: read the conversation so far, write the
 * plausible next user turn, optionally signal that the conversation
 * is naturally complete.
 *
 * Calls go to the OpenAI API directly (NOT through Layer) — we don't
 * want the user-simulator traffic polluting the gate the agent is
 * being analyzed on.
 */

import OpenAI from 'openai';

const USER_SIM_MODEL = 'gpt-4o-mini';

let _client: OpenAI | null = null;

function client(): OpenAI {
  if (_client) return _client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      'OPENAI_API_KEY is required for user-simulator (calls bypass Layer).'
    );
  }
  _client = new OpenAI({ apiKey: key });
  return _client;
}

const NEXT_TURN_TOOL: OpenAI.Chat.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'respond',
    description:
      'Emit the next user message in this support/research conversation. If the conversation has reached a natural ending point (questions answered, user satisfied, no more follow-ups make sense), set shouldContinue=false.',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description:
            'The next user message. 1–3 sentences. Build on the conversation so far — refer to specific facts the assistant gave you. Keep it realistic, not artificially complex.',
        },
        shouldContinue: {
          type: 'boolean',
          description:
            'true if there are more reasonable follow-up turns; false if the conversation has reached a satisfying conclusion and a real user would stop here.',
        },
      },
      required: ['message', 'shouldContinue'],
    },
  },
};

export interface NextUserTurn {
  message: string;
  shouldContinue: boolean;
}

export interface UserPersona {
  /** Short label of who the user is (e.g. "customer-support inbound"). */
  role: string;
  /**
   * 1–3 sentence description of the user's goals, demeanor, and what
   * a realistic conversation looks like for this domain. Helps the
   * simulator stay in-character without going off the rails.
   */
  guidance: string;
}

/**
 * Generate the next plausible user turn given the conversation so far.
 * Returns shouldContinue=false when the simulator judges the
 * conversation naturally complete — caller should respect that signal
 * to stop calling.
 */
export async function generateNextUserTurn(
  history: OpenAI.Chat.ChatCompletionMessageParam[],
  persona: UserPersona
): Promise<NextUserTurn> {
  const system = `You are simulating a real user in a multi-turn conversation. ${persona.guidance}

You will be shown the conversation history. Your job is to write the next plausible user message — what THIS user would actually say next.

Rules:
- Be specific: refer to information the assistant already gave you (numbers, names, IDs).
- Stay in the same conversation thread — don't randomly pivot unless a real user would.
- Realistic length: 1–3 sentences usually. Edge cases (frustration, confusion) can be shorter.
- When the assistant has answered everything reasonable and the user would naturally stop, set shouldContinue=false.

Always call the respond function.`;

  const completion = await client().chat.completions.create({
    model: USER_SIM_MODEL,
    max_tokens: 256,
    messages: [
      { role: 'system', content: system },
      // Recast assistant ↔ user so the simulator sees "the human" as the
      // role it should be writing for.
      ...history.map((m) => {
        if (m.role === 'assistant') {
          return { role: 'user' as const, content: stringContent(m.content) };
        }
        if (m.role === 'user') {
          return {
            role: 'assistant' as const,
            content: stringContent(m.content),
          };
        }
        return m;
      }),
    ],
    tools: [NEXT_TURN_TOOL],
    tool_choice: { type: 'function', function: { name: 'respond' } },
  });

  const call = completion.choices[0]?.message?.tool_calls?.[0];
  if (!call || call.type !== 'function') {
    throw new Error('user-simulator did not return a function call');
  }
  const parsed = JSON.parse(call.function.arguments) as NextUserTurn;
  return parsed;
}

function stringContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((c: any) => (typeof c === 'string' ? c : c?.text || ''))
      .join('');
  }
  return '';
}
