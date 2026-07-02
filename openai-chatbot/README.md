# OpenAI SDK Chatbot with Verlon AI

A streaming chatbot built with the **official OpenAI SDK** pointed at Verlon AI's OpenAI-compatible endpoint. No Verlon SDK required — change the base URL, keep your existing OpenAI code, and route requests through a Verlon gate to ANY model (GPT, Claude, Gemini, Mistral).

![Verlon AI](https://img.shields.io/badge/Verlon%20AI-OpenAI%20Compat-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## What This Demo Showcases

1. **Drop-in compatibility** - The OpenAI SDK works unchanged against `https://api.verlon.ai/v1`
2. **Gate-based routing** - Pass `gateId` and Verlon AI picks the model from your gate config; no `model` param needed
3. **Model freedom** - Switch the gate to Claude or Gemini in the dashboard; the OpenAI SDK code never changes
4. **Streaming** - Token-by-token streaming works exactly as it does against OpenAI

```typescript
// lib/openai.ts — the only change from a stock OpenAI setup
const openai = new OpenAI({
  baseURL: 'https://api.verlon.ai/v1',
  apiKey: process.env.VERLON_API_KEY,
});
```

## Prerequisites

- Node.js 18+ and pnpm
- A Verlon AI account ([Sign up](https://verlon.ai))
- Verlon AI API key

## Setup

### 1. Install

```bash
cd openai-chatbot
pnpm install
```

### 2. Create a Gate

1. Go to the [Verlon AI Dashboard](https://verlon.ai/dashboard)
2. Create a new chat gate and pick any primary model
3. Copy the gate ID

### 3. Configure Environment Variables

Create a `.env.local` file:

```bash
VERLON_API_KEY=your_api_key_here
VERLON_GATE_ID=your_gate_id_here
```

`VERLON_BASE_URL` is optional and defaults to `https://api.verlon.ai` (the `/v1` suffix is added in code).

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

The API route calls `openai.chat.completions.create()` with a `gateId` instead of a `model`:

```typescript
// app/api/chat/route.ts
const stream = await openai.chat.completions.create({
  messages,
  max_tokens: 500,
  gateId: GATE_ID, // Verlon AI extension — model comes from the gate config
  stream: true,
});
```

Verlon AI resolves the gate, routes to the configured model (with automatic fallbacks), tracks cost and usage, and streams back an OpenAI-shaped response.

## Learn More

- [Verlon AI Documentation](https://docs.verlon.ai)
- [OpenAI SDK Compatibility Guide](https://docs.verlon.ai/provider-compatibility/openai)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
