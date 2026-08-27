# SDK Chat Verification Examples

These examples verify the accuracy of the Verlon AI chat documentation, using the official `openai` package against the Verlon gateway.

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your credentials in `.env`:
- `VERLON_API_KEY`: Your Verlon API key from https://verlon.ai/dashboard
- `VERLON_GATE_ID`: Your gate UUID from the dashboard

3. Install dependencies:
```bash
pnpm install
```

## Run Examples

### Basic Chat
```bash
pnpm basic
```

### Streaming
```bash
pnpm streaming
```

## What This Verifies

From [/sdk-reference/chat](/sdk-reference/chat):
- ✓ The `openai` client with `baseURL: 'https://api.verlon.ai/v1'` and the gate UUID as `model`
- ✓ Basic chat with system and user messages via `chat.completions.create()`
- ✓ Streaming with `stream: true` and `chunk.choices[0]?.delta?.content`
- ✓ Response structure (`choices[0].message.content`, `model`, `usage`)
