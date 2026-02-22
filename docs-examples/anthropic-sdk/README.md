# Anthropic SDK Integration Example

This example demonstrates using Layer AI with the Anthropic SDK as documented in the Layer AI documentation.

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your credentials in `.env`:
- `LAYER_API_KEY`: Your Layer API key from https://uselayer.ai/dashboard
- `GATE_ID`: Your gate UUID from the dashboard

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

- ✓ Anthropic SDK works with Layer's base URL
- ✓ `gateId` parameter works correctly
- ✓ Streaming works as documented
- ✓ Response format matches documentation
