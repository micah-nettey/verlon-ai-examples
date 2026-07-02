/**
 * Programmatically create the gates each agent in this project needs.
 *
 * Idempotent: if a gate with the given name already exists for the
 * authenticated user, the script logs and skips it.
 *
 * Reads LAYER_API_KEY + LAYER_API_URL from the env file. Authenticates
 * via Bearer token (the same key the agents use at runtime). Prints
 * the env-var assignments at the end so you can paste them straight
 * into .env.local.
 *
 * Run:
 *   pnpm setup-gates
 */
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

interface GateSpec {
  // Env-var name to print at the end (e.g. SUPPORT_CLASSIFIER_GATE_ID).
  envVar: string;
  name: string;
  description?: string;
  model: string;
  // Agent gate fields.
  gateType?: 'agent';
  mode?: 'orchestrated' | 'observability';
  orchestrationType?: 'static' | 'dynamic';
  // Names of other gates in this list to attach as sub-gates after
  // creation. Resolved by name lookup at attach time.
  subGateNames?: string[];
}

const GATES: GateSpec[] = [
  // Customer-support specialists. The agent gate itself doubles as
  // the classifier/router — no separate "classifier" gate needed.
  {
    envVar: 'SUPPORT_BILLING_GATE_ID',
    name: 'support-billing',
    description: 'Billing / refund / subscription specialist.',
    model: 'gpt-4o',
  },
  {
    envVar: 'SUPPORT_TECHNICAL_GATE_ID',
    name: 'support-technical',
    description: 'Technical / setup / API integration specialist.',
    model: 'gpt-4o',
  },
  {
    envVar: 'SUPPORT_GENERAL_GATE_ID',
    name: 'support-general',
    description: 'General-purpose support fallback.',
    model: 'gpt-4o-mini',
  },
  {
    envVar: 'AGENT_SUPPORT_GATE_ID',
    name: 'agent-support',
    description:
      'Customer-support agent — the gate itself runs the classifier/router call, then dispatches to a specialist sub-gate.',
    model: 'gpt-4o-mini',
    gateType: 'agent',
    mode: 'orchestrated',
    orchestrationType: 'static',
    subGateNames: ['support-billing', 'support-technical', 'support-general'],
  },

  // Doc-extractor — single-call structured extraction.
  {
    envVar: 'EXTRACTOR_GATE_ID',
    name: 'doc-extractor',
    description: 'Extracts structured fields from unstructured passages.',
    model: 'gpt-4o-mini',
  },
];

interface ExistingGate {
  id: string;
  name: string;
  gateType?: string;
}

async function main() {
  const apiKey = process.env.LAYER_API_KEY;
  const apiUrl = process.env.LAYER_API_URL;
  if (!apiKey || !apiUrl) {
    console.error('LAYER_API_KEY and LAYER_API_URL must be set');
    process.exit(1);
  }

  console.log(`Talking to ${apiUrl} as ${apiKey.slice(0, 12)}...\n`);

  const existing = await api<ExistingGate[]>('GET', '/v1/gates', null);
  const byName = new Map(existing.map((g) => [g.name, g]));

  const created: { spec: GateSpec; id: string }[] = [];

  for (const spec of GATES) {
    const found = byName.get(spec.name);
    if (found) {
      console.log(`✓ ${spec.name} already exists (${found.id.slice(0, 8)}…)`);
      created.push({ spec, id: found.id });
      continue;
    }

    const body: Record<string, unknown> = {
      name: spec.name,
      description: spec.description,
      model: spec.model,
      taskType: 'chat',
    };
    if (spec.gateType) body.gateType = spec.gateType;
    if (spec.mode) body.mode = spec.mode;
    if (spec.orchestrationType) body.orchestrationType = spec.orchestrationType;

    const gate = await api<{ id: string; name: string }>(
      'POST',
      '/v1/gates',
      body
    );
    console.log(`+ ${spec.name} created (${gate.id.slice(0, 8)}…)`);
    created.push({ spec, id: gate.id });
    byName.set(gate.name, { id: gate.id, name: gate.name });
  }

  // Wire up sub-gates for any agent gate that declares them.
  for (const { spec, id: agentId } of created) {
    if (!spec.subGateNames?.length) continue;
    const currentSubs = await api<ExistingGate[]>(
      'GET',
      `/v1/gates/${agentId}/sub-gates`,
      null
    );
    const attachedIds = new Set(currentSubs.map((g) => g.id));
    for (const subName of spec.subGateNames) {
      const sub = byName.get(subName);
      if (!sub) {
        console.warn(`  ! sub-gate "${subName}" missing — skipped attach`);
        continue;
      }
      if (attachedIds.has(sub.id)) {
        console.log(`  ✓ ${spec.name} ← ${subName} already attached`);
        continue;
      }
      await api('POST', `/v1/gates/${agentId}/sub-gates/attach`, {
        subGateId: sub.id,
      });
      console.log(`  + ${spec.name} ← ${subName} attached`);
    }
  }

  console.log('\n--- paste into .env.local ---');
  for (const { spec, id } of created) {
    console.log(`${spec.envVar}=${id}`);
  }
}

async function api<T = unknown>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body: unknown
): Promise<T> {
  const apiUrl = process.env.LAYER_API_URL!;
  const apiKey = process.env.LAYER_API_KEY!;
  const url = new URL(path, apiUrl);
  const payload = body === null ? undefined : JSON.stringify(body);
  const isHttps = url.protocol === 'https:';
  const request = isHttps ? httpsRequest : httpRequest;

  return new Promise((resolve, reject) => {
    const req = request(
      {
        method,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString();
          if (!res.statusCode || res.statusCode >= 400) {
            reject(
              new Error(`${method} ${path} → ${res.statusCode}: ${text}`)
            );
            return;
          }
          if (!text) {
            resolve(undefined as T);
            return;
          }
          try {
            resolve(JSON.parse(text) as T);
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

main().catch((err) => {
  console.error('setup-gates failed:', err.message);
  process.exit(1);
});
