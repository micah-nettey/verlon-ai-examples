/**
 * Volume driver for the doc-extractor agent.
 *
 * Doc-extractor is single-shot by design (no orchestrator, no
 * sub-gates, no sessions) so this driver is much simpler than the
 * support / research session simulators — it just iterates the
 * EXTRACTOR_PASSAGES array and runs each passage through extractOne.
 *
 * The point is to give Tracer + Cortex a per-request volume on the
 * doc-extractor gate so they have signal to analyze.
 *
 * Run via Layer:
 *   pnpm simulate-extractions
 */
import { extractOne } from '../agents/doc-extractor.js';
import { EXTRACTOR_PASSAGES } from '../scenarios/extractor-scenarios.js';

interface ExtractionRecord {
  name: string;
  sessionId: string;
  ok: boolean;
  errorMessage?: string;
}

async function main() {
  const useLayer = process.env.USE_LAYER === 'true';
  if (!useLayer) {
    console.log(
      '(USE_LAYER is not true — calls hit OpenAI directly, Layer-side gate metrics will not update.)'
    );
  }

  const records: ExtractionRecord[] = [];
  for (let i = 0; i < EXTRACTOR_PASSAGES.length; i++) {
    const p = EXTRACTOR_PASSAGES[i];
    console.log(
      `\n[${i + 1}/${EXTRACTOR_PASSAGES.length}] extracting "${p.name}"...`
    );
    try {
      const { sessionId } = await extractOne(p.passage);
      records.push({ name: p.name, sessionId, ok: true });
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      console.error(`  ✗ failed: ${msg}`);
      records.push({
        name: p.name,
        sessionId: '',
        ok: false,
        errorMessage: msg,
      });
    }
  }

  console.log('\n\n=== summary ===');
  const ok = records.filter((r) => r.ok).length;
  console.log(`  ${ok}/${records.length} extractions succeeded`);
  for (const r of records.filter((r) => !r.ok)) {
    console.log(`  ✗ ${r.name}: ${r.errorMessage}`);
  }

  console.log(
    "\nVerify in DB:\n  psql -d layer_ai_dev -c \"SELECT g.name, COUNT(*) AS calls, SUM(r.total_tokens) AS tokens, SUM(r.cost_usd::numeric)::numeric(10,6) AS cost FROM requests r JOIN gates g ON g.id = r.gate_id WHERE g.name = 'doc-extractor' AND r.created_at > NOW() - INTERVAL '15 minutes' GROUP BY g.name;\"\n"
  );
}

main().catch((err) => {
  console.error('Extraction simulator crashed:', err);
  process.exit(1);
});
