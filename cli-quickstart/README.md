# Layer AI CLI Quickstart

The smallest possible project for trying out [`@layer-ai/cli`](https://www.npmjs.com/package/@layer-ai/cli). Nothing here but a `package.json` that installs the CLI — every command runs against your Layer account, no app code required.

## Install

```bash
npm install
```

That's it. The CLI is now available at `./node_modules/.bin/layer` (use it via `npx layer …`).

## Authenticate

The CLI works two ways:

```bash
# Path 1 — agent / CI / Docker: zero-setup env var
export LAYER_API_KEY=sk-...
export LAYER_BASE_URL=https://api.uselayer.ai   # optional; this is the default

# Path 2 — human at a terminal: save credentials once
npx layer login --api-key sk-...
```

## Try it

```bash
# Identify yourself + verify the API key works
npx layer whoami

# Run the diagnostics suite — useful first stop if anything looks wrong
npx layer doctor

# List your existing gates (source of truth for gate UUIDs)
npx layer gate list

# Tail logs in real time
npx layer logs --tail --since 1h

# Current spend + tier limits
npx layer usage

# Cortex recommendations across all your gates
npx layer recommend
```

## Create a gate from the terminal

```bash
npx layer gate create \
  --name quickstart-gate \
  --model gpt-4o-mini \
  --description "My first Layer gate from the CLI"
```

The response is JSON when piped, coloured human-readable text in a terminal. Capture the new gate's UUID and use it on every subsequent management call:

```bash
GATE_ID=$(npx layer gate create --name … --model … | jq -r '.id')
npx layer gate get "$GATE_ID"
npx layer gate update "$GATE_ID" --temperature 0.5
npx layer gate delete "$GATE_ID" --force
```

> Gate names are not guaranteed unique — every management op takes the gate's **UUID** (from `layer gate list`), not its name. Passing a name rejects with a structured `invalid_field` error (exit 2). The exception is `gate create`, where `--name` is the new gate's own name.

## Designed for coding agents

Every command auto-detects whether stdout is a terminal:

- **Terminal** → human-readable coloured text.
- **Piped / non-TTY** → machine-readable JSON, with errors as `{ code, message, recovery? }` on stderr and a non-zero exit code mapped from `code` (2=usage, 3=auth, 4=not_found, 5=rate_limited, 6=server_error, 7=network_error, 9=conflict, 10=not_a_tty).

So:

```bash
npx layer gate list | jq '.[] | select(.spendingCurrent > "10.00")'
npx layer gate delete "$ID" || case $? in
  4) echo "already gone" ;;
  10) echo "needs --force" ;;
  *) echo "unexpected failure" ;;
esac
```

Set `LAYER_OUTPUT_FORMAT=json` to pin JSON across a whole session, or pass `--format=json` / `--format=table` on any individual command to override the auto-detection.

## Full command surface

Run `npx layer --help` (or `npx layer <command> --help`) for the live reference. Mapping to dashboard pages:

| CLI command | Dashboard equivalent |
|---|---|
| `layer whoami` | header user menu |
| `layer gate list / get / create / update / delete / suggestions` | `/dashboard/gates` |
| `layer agent-gate list / get / create / update / delete` | `/dashboard/agent-gates` |
| `layer project list / get / create / update / delete` | `/dashboard/projects` |
| `layer logs` | `/dashboard/logs` |
| `layer experiment list / get / status / start / accept / reject` | `/dashboard/experiments` |
| `layer recommend [--gate <id>]` | `/dashboard/intelligence` |
| `layer usage` | `/dashboard/usage` |
| `layer doctor` | (CLI-only) |
| `layer login` | (auth flow) |

API-key management (create / list / revoke) lives only in the dashboard at <https://uselayer.ai/dashboard/settings/keys> — by policy, a leaked API key shouldn't be able to enumerate, mint, or revoke sibling keys.
