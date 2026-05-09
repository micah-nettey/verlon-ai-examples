import OpenAI from 'openai';

/**
 * Build an OpenAI client. When USE_LAYER=true, the client is pointed
 * at Layer's OpenAI-compat endpoint (/v1/chat-completions) using the
 * Layer API key. Mirrors anthropic-client.ts — same drop-in pattern,
 * different vendor SDK.
 */
export function buildOpenAIClient(): OpenAI {
  const useLayer = process.env.USE_LAYER === 'true';

  if (useLayer) {
    const layerKey = process.env.LAYER_API_KEY;
    const layerUrl = process.env.LAYER_API_URL;
    if (!layerKey || !layerUrl) {
      throw new Error(
        'USE_LAYER=true but LAYER_API_KEY / LAYER_API_URL are missing'
      );
    }
    // Layer hosts an OpenAI-compatible /v1/chat-completions endpoint.
    // Bearer auth uses the Layer API key — same as direct OpenAI.
    return new OpenAI({ apiKey: layerKey, baseURL: `${layerUrl}/v1` });
  }

  const directKey = process.env.OPENAI_API_KEY;
  if (!directKey) {
    throw new Error('OPENAI_API_KEY is required when USE_LAYER is not true');
  }
  return new OpenAI({ apiKey: directKey });
}

/**
 * Per-call header builder. Reused from the Anthropic side — the same
 * `x-layer-gate-id` / `x-layer-session-id` headers identify the gate
 * and link multi-turn sessions for both compat endpoints.
 */
export function layerHeaders(opts: {
  gateIdEnvVar: string;
  sessionId?: string;
}): Record<string, string> {
  if (process.env.USE_LAYER !== 'true') return {};
  const gateId = process.env[opts.gateIdEnvVar];
  if (!gateId) {
    throw new Error(
      `USE_LAYER=true but ${opts.gateIdEnvVar} is not set — needed for the Layer routing header`
    );
  }
  const headers: Record<string, string> = { 'x-layer-gate-id': gateId };
  if (opts.sessionId) headers['x-layer-session-id'] = opts.sessionId;
  return headers;
}
