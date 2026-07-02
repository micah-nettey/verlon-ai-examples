import Anthropic from '@anthropic-ai/sdk';

/**
 * Build an Anthropic client. When USE_VERLON=true, the client is pointed
 * at Verlon's Anthropic-compat endpoint (/v1/messages) using the Verlon
 * API key. The agent code below stays identical — only the constructor
 * call differs. This is the entire customer-adoption diff for the SDK
 * init step.
 */
export function buildAnthropicClient(): Anthropic {
  const useVerlon = process.env.USE_VERLON === 'true';

  if (useVerlon) {
    const verlonKey = process.env.VERLON_API_KEY;
    const verlonUrl = process.env.VERLON_BASE_URL;
    if (!verlonKey || !verlonUrl) {
      throw new Error(
        'USE_VERLON=true but VERLON_API_KEY / VERLON_BASE_URL are missing'
      );
    }
    // Verlon hosts an Anthropic-compatible /v1/messages endpoint. The
    // SDK's default baseURL is https://api.anthropic.com — point it
    // at Verlon instead. Authentication uses the Verlon API key as a
    // bearer token (instead of Anthropic's x-api-key header), so we
    // pass an empty apiKey and override authToken.
    return new Anthropic({
      apiKey: 'unused-verlon-bearer-overrides',
      baseURL: verlonUrl,
      authToken: verlonKey,
    });
  }

  const directKey = process.env.ANTHROPIC_API_KEY;
  if (!directKey) {
    throw new Error('ANTHROPIC_API_KEY is required when USE_VERLON is not true');
  }
  return new Anthropic({ apiKey: directKey });
}

/**
 * Per-call header builder. In Verlon mode, every call needs an
 * `x-verlon-gate-id` header so Verlon knows which gate the call belongs
 * to (and, optionally, an `x-verlon-session-id` so multi-turn agent
 * sessions are linked together).
 *
 * In direct mode this returns an empty object — the SDK ignores
 * unknown headers, so passing them through always is also safe.
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
