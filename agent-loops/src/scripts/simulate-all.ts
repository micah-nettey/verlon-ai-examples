/**
 * Top-level driver — runs all three agent simulators sequentially.
 * Use this when you want a full volume pass for IAN-loop validation
 * (Tracer / Cortex / Nexus / Einstein need a meaningful number of
 * sessions per gate before their analyses fire).
 *
 * Run via Verlon:
 *   pnpm simulate-all
 *
 * Sequential by design — running them in parallel would let the rate
 * limiter trip and obscures the per-driver cost / time accounting.
 */
import { spawnSync } from 'node:child_process';

interface DriverRun {
  label: string;
  script: string;
  ms: number;
  exitCode: number;
}

const DRIVERS: { label: string; script: string }[] = [
  { label: 'customer-support', script: 'simulate' },
  { label: 'research', script: 'simulate-research' },
  { label: 'doc-extractor', script: 'simulate-extractions' },
];

function runDriver(label: string, script: string): DriverRun {
  console.log(`\n\n========== ${label} (pnpm ${script}) ==========\n`);
  const t0 = Date.now();
  const res = spawnSync('pnpm', ['run', script], { stdio: 'inherit' });
  const ms = Date.now() - t0;
  return { label, script, ms, exitCode: res.status ?? -1 };
}

function fmtMs(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

const t0 = Date.now();
const runs: DriverRun[] = [];
for (const d of DRIVERS) {
  runs.push(runDriver(d.label, d.script));
}
const total = Date.now() - t0;

console.log('\n\n========== run summary ==========');
for (const r of runs) {
  const status = r.exitCode === 0 ? 'ok' : `FAILED (exit ${r.exitCode})`;
  console.log(`  ${r.label.padEnd(20)} ${fmtMs(r.ms).padStart(8)}  ${status}`);
}
console.log(`  ${'total'.padEnd(20)} ${fmtMs(total).padStart(8)}`);

const anyFail = runs.some((r) => r.exitCode !== 0);
process.exit(anyFail ? 1 : 0);
