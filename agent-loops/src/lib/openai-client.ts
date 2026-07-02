import OpenAI from 'openai';

/**
 * Build an OpenAI client. When USE_VERLON=true, the client is pointed
 * at Verlon's OpenAI-compat endpoint (/v1/chat-completions) using the
 * Verlon API key. Mirrors anthropic-client.ts — same drop-in pattern,
 * different vendor SDK.
 */
export function buildOpenAIClient(): OpenAI {
  const useVerlon = process.env.USE_VERLON === 'true';

  if (useVerlon) {
    const verlonKey = process.env.VERLON_API_KEY;
    const verlonUrl = process.env.VERLON_BASE_URL;
    if (!verlonKey || !verlonUrl) {
      throw new Error(
        'USE_VERLON=true but VERLON_API_KEY / VERLON_BASE_URL are missing'
      );
    }
    // Verlon hosts an OpenAI-compatible /v1/chat-completions endpoint.
    // Bearer auth uses the Verlon API key — same as direct OpenAI.
    return new OpenAI({ apiKey: verlonKey, baseURL: `${verlonUrl}/v1` });
  }

  const directKey = process.env.OPENAI_API_KEY;
  if (!directKey) {
    throw new Error('OPENAI_API_KEY is required when USE_VERLON is not true');
  }
  return new OpenAI({ apiKey: directKey });
}

/**
 * Per-call header builder. Reused from the Anthropic side — the same
 * `x-verlon-gate-id` / `x-verlon-session-id` headers identify the gate
 * and link multi-turn sessions for both compat endpoints.
 */
export function verlonHeaders(opts: {
  gateIdEnvVar: string;
  sessionId?: string;
}): Record<string, string> {
  if (process.env.USE_VERLON !== 'true') return {};
  const gateId = process.env[opts.gateIdEnvVar];
  if (!gateId) {
    throw new Error(
      `USE_VERLON=true but ${opts.gateIdEnvVar} is not set — needed for the Verlon routing header`
    );
  }
  const headers: Record<string, string> = { 'x-verlon-gate-id': gateId };
  if (opts.sessionId) headers['x-verlon-session-id'] = opts.sessionId;
  return headers;
}
