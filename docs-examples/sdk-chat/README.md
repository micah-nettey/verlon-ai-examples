# SDK Chat Verification Examples

These examples verify the accuracy of the Verlon AI SDK chat documentation.

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your credentials in `.env`:
- `VERLON_API_KEY`: Your Verlon API key from https://useverlon.ai/dashboard
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
- ✓ Basic chat with system and user messages
- ✓ Streaming with `chatStream()`
- ✓ Response structure (content, cost, model)
