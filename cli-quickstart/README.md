# Verlon AI CLI Quickstart

The smallest possible project for trying out [`@verlon-ai/cli`](https://www.npmjs.com/package/@verlon-ai/cli). Nothing here but a `package.json` that installs the CLI — every command runs against your Verlon account, no app code required.

## Install

```bash
pnpm install
```

That's it. The CLI is now available at `./node_modules/.bin/verlon` (use it via `npx verlon …`).

## Authenticate

The CLI works two ways:

```bash
# Path 1 — agent / CI / Docker: zero-setup env var
export VERLON_API_KEY=sk-vrln-...
export VERLON_BASE_URL=https://api.verlon.ai   # optional; this is the default

# Path 2 — human at a terminal: save credentials once
npx verlon login --api-key sk-...
```

## Try it

```bash
# Identify yourself + verify the API key works
npx verlon whoami

# Run the diagnostics suite — useful first stop if anything looks wrong
npx verlon doctor

# List your existing gates (source of truth for gate UUIDs)
npx verlon gate list

# Tail logs in real time
npx verlon logs --tail --since 1h

# Current spend + tier limits
npx verlon usage

# Cortex recommendations across all your gates
npx verlon recommend
```

## Create a gate from the terminal

```bash
npx verlon gate create \
  --name quickstart-gate \
  --model gpt-4o-mini \
  --description "My first Verlon gate from the CLI"
```

The response is JSON when piped, coloured human-readable text in a terminal. Capture the new gate's UUID and use it on every subsequent management call:

```bash
GATE_ID=$(npx verlon gate create --name … --model … | jq -r '.id')
npx verlon gate get "$GATE_ID"
npx verlon gate update "$GATE_ID" --temperature 0.5
npx verlon gate delete "$GATE_ID" --force
```

> Gate names are not guaranteed unique — every management op takes the gate's **UUID** (from `verlon gate list`), not its name. Passing a name rejects with a structured `invalid_field` error (exit 2). The exception is `gate create`, where `--name` is the new gate's own name.

## Designed for coding agents

Every command auto-detects whether stdout is a terminal:

- **Terminal** → human-readable coloured text.
- **Piped / non-TTY** → machine-readable JSON, with errors as `{ code, message, recovery? }` on stderr and a non-zero exit code mapped from `code` (2=usage, 3=auth, 4=not_found, 5=rate_limited, 6=server_error, 7=network_error, 9=conflict, 10=not_a_tty).

So:

```bash
npx verlon gate list | jq '.[] | select(.spendingCurrent > "10.00")'
npx verlon gate delete "$ID" || case $? in
  4) echo "already gone" ;;
  10) echo "needs --force" ;;
  *) echo "unexpected failure" ;;
esac
```

Set `VERLON_OUTPUT_FORMAT=json` to pin JSON across a whole session, or pass `--format=json` / `--format=table` on any individual command to override the auto-detection.

## Full command surface

Run `npx verlon --help` (or `npx verlon <command> --help`) for the live reference. Mapping to dashboard pages:

| CLI command | Dashboard equivalent |
|---|---|
| `verlon whoami` | header user menu |
| `verlon gate list / get / create / update / delete / suggestions` | `/dashboard/gates` |
| `verlon agent-gate list / get / create / update / delete` | `/dashboard/agent-gates` |
| `verlon project list / get / create / update / delete` | `/dashboard/projects` |
| `verlon logs` | `/dashboard/logs` |
| `verlon experiment list / get / status / start / accept / reject` | `/dashboard/experiments` |
| `verlon recommend [--gate <id>]` | `/dashboard/intelligence` |
| `verlon usage` | `/dashboard/usage` |
| `verlon doctor` | (CLI-only) |
| `verlon login` | (auth flow) |

API-key management (create / list / revoke) lives only in the dashboard at <https://verlon.ai/dashboard/settings/keys> — by policy, a leaked API key shouldn't be able to enumerate, mint, or revoke sibling keys.
