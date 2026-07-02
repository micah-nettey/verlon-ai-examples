import Anthropic from '@anthropic-ai/sdk';

/**
 * Build an Anthropic client. When USE_LAYER=true, the client is pointed
 * at Layer's Anthropic-compat endpoint (/v1/messages) using the Layer
 * API key. The agent code below stays identical — only the constructor
 * call differs. This is the entire customer-adoption diff for the SDK
 * init step.
 */
export function buildAnthropicClient(): Anthropic {
  const useLayer = process.env.USE_LAYER === 'true';

  if (useLayer) {
    const layerKey = process.env.LAYER_API_KEY;
    const layerUrl = process.env.LAYER_API_URL;
    if (!layerKey || !layerUrl) {
      throw new Error(
        'USE_LAYER=true but LAYER_API_KEY / LAYER_API_URL are missing'
      );
    }
    // Layer hosts an Anthropic-compatible /v1/messages endpoint. The
    // SDK's default baseURL is https://api.anthropic.com — point it
    // at Layer instead. Authentication uses the Layer API key as a
    // bearer token (instead of Anthropic's x-api-key header), so we
    // pass an empty apiKey and override authToken.
    return new Anthropic({
      apiKey: 'unused-layer-bearer-overrides',
      baseURL: layerUrl,
      authToken: layerKey,
    });
  }

  const directKey = process.env.ANTHROPIC_API_KEY;
  if (!directKey) {
    throw new Error('ANTHROPIC_API_KEY is required when USE_LAYER is not true');
  }
  return new Anthropic({ apiKey: directKey });
}

/**
 * Per-call header builder. In Layer mode, every call needs an
 * `x-layer-gate-id` header so Layer knows which gate the call belongs
 * to (and, optionally, an `x-layer-session-id` so multi-turn agent
 * sessions are linked together).
 *
 * In direct mode this returns an empty object — the SDK ignores
 * unknown headers, so passing them through always is also safe.
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
