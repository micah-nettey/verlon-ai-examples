# OpenAI SDK Integration Example

This example tests the code from the [OpenAI SDK Integration documentation](https://docs.verlon.ai/integrations/openai-sdk).

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your credentials in `.env`:
```
VERLON_API_KEY=your-actual-api-key
VERLON_GATE_ID=your-actual-gate-id
```

3. Install dependencies:
```bash
pnpm install
```

## Examples

### Basic Request
Tests the basic OpenAI SDK integration with `gateId` parameter:
```bash
pnpm basic
```

### Streaming
Tests streaming responses:
```bash
pnpm streaming
```

### All Methods
Tests all three gate specification methods from the documentation:
1. Using `gateId` (recommended)
2. Using `model` field
3. Using `X-Verlon-Gate-Id` header

```bash
pnpm all-methods
```

## Expected Output

- **basic**: Should print "Hello!" response from the AI
- **streaming**: Should stream a joke token by token
- **all-methods**: Should successfully test all three methods and print confirmation messages
