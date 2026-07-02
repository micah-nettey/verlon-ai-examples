/**
 * Manual IAN trigger — call after `pnpm simulate-all` finishes.
 *
 * Sequence (per agent gate):
 *   1. End every active session that belongs to this gate so Tracer
 *      can analyze it (Tracer requires completed / idle / budget_exceeded
 *      / runaway state).
 *   2. POST /v3/sessions/:id/analyze for each — runs Tracer per session
 *      and writes a session_analyses row.
 *   3. POST /v3/sessions/gate/:gateId/cortex — kicks off Cortex's
 *      cross-session report (runs async on the server).
 *   4. POST /v1/gates/:gateId/einstein/suggest — asks Einstein's
 *      Designer for an experiment proposal based on the new analyses.
 *
 * Skips:
 *   - Nexus runs on a monthly/weekly cron with no public manual trigger
 *     (would need a temporary admin endpoint or direct DB seeding).
 *   - doc-extractor is a non-agent gate, so no sessions / no Tracer /
 *     no Cortex apply. Einstein Designer can still propose against it
 *     using the per-request data.
 *
 * Run:
 *   pnpm trigger-ian
 */
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

interface Session {
  id: string;
  sessionId?: string;
  status: string;
  totalRequests?: number;
}

const AGENT_GATES = [
  { name: 'agent-research', envVar: 'RESEARCH_ORCHESTRATOR_GATE_ID' },
  { name: 'agent-support', envVar: 'AGENT_SUPPORT_GATE_ID' },
];

const STANDALONE_GATES = [
  { name: 'doc-extractor', envVar: 'EXTRACTOR_GATE_ID' },
];

async function main() {
  const apiKey = process.env.VERLON_API_KEY;
  const apiUrl = process.env.VERLON_BASE_URL;
  if (!apiKey || !apiUrl) {
    console.error('VERLON_API_KEY and VERLON_BASE_URL required');
    process.exit(1);
  }

  console.log(`Talking to ${apiUrl}\n`);

  for (const g of AGENT_GATES) {
    const gateId = process.env[g.envVar];
    if (!gateId) {
      console.warn(`! ${g.envVar} not set — skipping ${g.name}`);
      continue;
    }
    console.log(`========== ${g.name} (${gateId.slice(0, 8)}…) ==========`);

    // Fetch all sessions for this gate.
    const { sessions } = await api<{ sessions: Session[]; total: number }>(
      'GET',
      `/v1/gates/${gateId}/sessions?limit=500`,
      null
    );
    console.log(`  found ${sessions.length} sessions`);

    // 1. End any active session.
    let ended = 0;
    for (const s of sessions) {
      if (s.status === 'active' || s.status === 'idle') {
        try {
          await api('POST', `/v3/sessions/${s.id}/end`, {});
          ended++;
        } catch (err: any) {
          console.warn(`    ! end ${s.id.slice(0, 8)}: ${err.message}`);
        }
      }
    }
    console.log(`  ended ${ended} active/idle sessions`);

    // 2. Trigger Tracer per session.
    let traced = 0;
    let traceFailed = 0;
    for (const s of sessions) {
      try {
        await api('POST', `/v3/sessions/${s.id}/analyze`, {});
        traced++;
      } catch (err: any) {
        traceFailed++;
        console.warn(
          `    ! analyze ${s.id.slice(0, 8)}: ${err.message.split('\n')[0]}`
        );
      }
    }
    console.log(
      `  tracer: ${traced} succeeded, ${traceFailed} failed (out of ${sessions.length})`
    );

    // 3. Trigger Cortex (async on server side).
    try {
      await api('POST', `/v3/sessions/gate/${gateId}/cortex`, {});
      console.log(`  cortex: run kicked off (async, check intelligence_reports)`);
    } catch (err: any) {
      console.warn(`  ! cortex: ${err.message.split('\n')[0]}`);
    }

    // 4. Trigger Einstein Designer.
    try {
      const result = await api<any>(
        'POST',
        `/v1/gates/${gateId}/einstein/suggest`,
        {}
      );
      console.log(
        `  einstein designer: ${JSON.stringify(result).slice(0, 160)}…`
      );
    } catch (err: any) {
      console.warn(`  ! einstein: ${err.message.split('\n')[0]}`);
    }

    console.log();
  }

  // Standalone gates — Cortex still works on these (it analyzes
  // request_analyses rather than session_analyses) plus Einstein
  // Designer. Skipping Cortex here was a previous bug that left
  // standalone gates with no Intelligence Report at all.
  for (const g of STANDALONE_GATES) {
    const gateId = process.env[g.envVar];
    if (!gateId) {
      console.warn(`! ${g.envVar} not set — skipping ${g.name}`);
      continue;
    }
    console.log(`========== ${g.name} (${gateId.slice(0, 8)}…) ==========`);
    try {
      await api('POST', `/v3/sessions/gate/${gateId}/cortex`, {});
      console.log(`  cortex: run kicked off (async, check intelligence_reports)`);
    } catch (err: any) {
      console.warn(`  ! cortex: ${err.message.split('\n')[0]}`);
    }
    try {
      const result = await api<any>(
        'POST',
        `/v1/gates/${gateId}/einstein/suggest`,
        {}
      );
      console.log(
        `  einstein designer: ${JSON.stringify(result).slice(0, 160)}…`
      );
    } catch (err: any) {
      console.warn(`  ! einstein: ${err.message.split('\n')[0]}`);
    }
    console.log();
  }

  console.log('Done. Inspect outputs in DB:');
  console.log(
    "  psql -d layer_ai_dev -c \"SELECT g.name, COUNT(*) FROM session_analyses sa JOIN agent_sessions s ON s.id = sa.session_id JOIN gates g ON g.id = s.gate_id WHERE sa.created_at > NOW() - INTERVAL '15 minutes' GROUP BY g.name;\""
  );
  console.log(
    "  psql -d layer_ai_dev -c \"SELECT g.name, ir.status, ir.cost FROM intelligence_reports ir JOIN gates g ON g.id = ir.gate_id WHERE ir.created_at > NOW() - INTERVAL '15 minutes' ORDER BY ir.created_at;\""
  );
  console.log(
    "  psql -d layer_ai_dev -c \"SELECT g.name, ea.mode, ea.outcome->>'variantType' AS variant, ea.created_at FROM einstein_activity ea JOIN gates g ON g.id = ea.gate_id WHERE ea.created_at > NOW() - INTERVAL '15 minutes' ORDER BY ea.created_at;\""
  );
}

async function api<T = unknown>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body: unknown
): Promise<T> {
  const apiUrl = process.env.VERLON_BASE_URL!;
  const apiKey = process.env.VERLON_API_KEY!;
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
            reject(new Error(`${method} ${path} → ${res.statusCode}: ${text}`));
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
  console.error('trigger-ian failed:', err.message);
  process.exit(1);
});
