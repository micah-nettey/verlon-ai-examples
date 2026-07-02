# Anthropic SDK Integration Example

This example demonstrates using Verlon AI with the Anthropic SDK as documented in the Verlon AI documentation.

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

### Basic Example
```bash
pnpm basic
```

### Streaming Example
```bash
pnpm streaming
```

## What This Verifies

- ✓ Anthropic SDK works with Verlon's base URL
- ✓ `gateId` parameter works correctly
- ✓ Streaming works as documented
- ✓ Response format matches documentation
