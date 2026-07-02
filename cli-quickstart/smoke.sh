#!/usr/bin/env bash
# Smoke test for @verlon-ai/cli. Exercises version, whoami, doctor, and
# gate list in JSON mode so you can eyeball auth wiring and output-format
# handling without touching any account state.
#
# Usage:
#   VERLON_API_KEY=sk-vrln-... bash smoke.sh
#   VERLON_API_KEY=sk-vrln-... VERLON_CLI_BIN="node /abs/path/dist/index.js" bash smoke.sh

set -euo pipefail

if [ -z "${VERLON_API_KEY:-}" ]; then
  echo "error: VERLON_API_KEY env var is required" >&2
  exit 1
fi

# Default to the locally installed CLI. Override VERLON_CLI_BIN to point
# at a local build during development.
CLI="${VERLON_CLI_BIN:-npx verlon}"

echo "--- Smoke target: $CLI" >&2

echo "--- verlon --version" >&2
$CLI --version

echo "--- verlon whoami" >&2
$CLI whoami --format=json

echo "--- verlon doctor" >&2
$CLI doctor --format=json

echo "--- verlon gate list (first entries)" >&2
GATES_JSON="$($CLI gate list --format=json)"
printf '%s' "$GATES_JSON" | head -c 600
echo ""

echo "--- done" >&2
