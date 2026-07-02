# Verlon AI MCP Quickstart

The smallest possible setup for trying out [`@verlon-ai/mcp`](https://www.npmjs.com/package/@verlon-ai/mcp). The MCP server isn't really "installed" the way SDKs are — your MCP client (Claude Code, Cursor, Cline) spawns it as a subprocess via `npx`. This folder is a place to land the config snippets and a smoke script that proves the server is alive without needing a real MCP client.

## What's in here

- `smoke.sh` — pipes a JSON-RPC handshake at the server (initialize → tools/list → tools/call list_gates) and prints the responses. Useful for verifying install, auth, and tool registration in isolation, no MCP client required.
- Sample MCP client config snippets below.

## Configure your MCP client

### Claude Code

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or the equivalent path on your OS:

```json
{
  "mcpServers": {
    "verlon": {
      "command": "npx",
      "args": ["-y", "@verlon-ai/mcp"],
      "env": {
        "VERLON_API_KEY": "sk-..."
      }
    }
  }
}
```

Restart Claude Code. The `verlon` server should appear in the tools list, and Claude can call `verlon:list_gates` against your account.

### Cursor

Settings → Features → MCP Servers, same JSON shape as above.

### Any other MCP-compatible client

Spawn `npx -y @verlon-ai/mcp` over stdio with `VERLON_API_KEY` in the subprocess environment.

## Smoke test

```bash
# Default — talks to the published @verlon-ai/mcp via npx
VERLON_API_KEY=sk-... bash smoke.sh

# Or — point at a local build (e.g. when developing against the monorepo)
VERLON_API_KEY=sk-... VERLON_MCP_BIN="node /path/to/verlon-ai-internal/packages/mcp/dist/index.js" bash smoke.sh
```

Expected output: three JSON-RPC responses — `initialize` (server info), `tools/list` (one tool: `list_gates`), and `tools/call` (your gates, or an `isError` if your API key can't reach the backend).

## Configuration

| Env var | Required | Default | Notes |
|---|---|---|---|
| `VERLON_API_KEY` | Yes | — | Your Verlon API key. |
| `VERLON_BASE_URL` | No | `https://api.verlon.ai` | Override for self-hosted Verlon. |
