#!/usr/bin/env bash
# Smoke test for @verlon-ai/mcp.
# Pipes a JSON-RPC handshake at the MCP server over stdio: initialize →
# tools/list → tools/call list_gates. Prints each response so you can
# eyeball protocol version, tool registration, and auth wiring without
# needing an MCP client running.
#
# Usage:
#   VERLON_API_KEY=sk-... bash smoke.sh
#   VERLON_API_KEY=sk-... VERLON_MCP_BIN="node /abs/path/dist/index.js" bash smoke.sh

set -euo pipefail

if [ -z "${VERLON_API_KEY:-}" ]; then
  echo "error: VERLON_API_KEY env var is required" >&2
  exit 1
fi

# Default to the published package via npx. Override VERLON_MCP_BIN to
# point at a local build during development.
MCP_BIN="${VERLON_MCP_BIN:-npx -y @verlon-ai/mcp}"

echo "--- Smoke target: $MCP_BIN" >&2
echo "" >&2

# Three JSON-RPC messages, newline-delimited, piped to the server's
# stdin. A short sleep after the last one gives the server time to
# respond before we close stdin and EOF terminates the process.
{
  echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"smoke","version":"0.0.1"}}}'
  echo '{"jsonrpc":"2.0","method":"notifications/initialized"}'
  echo '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
  echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_gates","arguments":{}}}'
  sleep 1
} | $MCP_BIN 2>/dev/null

echo "" >&2
echo "--- done" >&2
