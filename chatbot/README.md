# AI Chatbot with Verlon AI

A modern, responsive chatbot that demonstrates Verlon AI's smart routing, model normalization, and cost tracking capabilities. Switch between different AI models seamlessly while maintaining conversation context.

![Verlon AI Chatbot](https://img.shields.io/badge/Verlon%20AI-Chatbot-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Features

- 🤖 **Smart AI Routing** - Automatic model selection and fallback handling via Verlon AI gates
- 💬 **Conversational UI** - Beautiful, modern chat interface with message history
- 📊 **Real-time Metrics** - View model used, cost, and latency for each response
- 🎨 **Dark Mode Support** - Seamless light/dark theme switching
- ⚡ **Fast Performance** - Built with Next.js 16 and Turbopack
- 🔄 **Context Preservation** - Maintains conversation context across all interactions

## What This Demo Showcases

This chatbot demonstrates Verlon AI's core capabilities:

1. **Gate-Based Routing**: All chat requests route through a Verlon AI gate that handles model selection
2. **Automatic Fallbacks**: If the primary model fails, Verlon AI automatically tries fallback models
3. **Cost Tracking**: See the exact cost of each AI response
4. **Model Normalization**: Unified API across different AI providers (OpenAI, Anthropic, Google, etc.)
5. **Performance Monitoring**: Track latency for every request
6. **Usage Tracking**: All requests are automatically tracked in your Verlon AI dashboard

## Prerequisites

- Node.js 18+ and pnpm
- A Verlon AI account ([Sign up](https://verlon.ai))
- Verlon AI API key

## Setup

### 1. Clone and Install

```bash
# Navigate to the chatbot directory
cd chatbot

# Install dependencies
pnpm install
```

### 2. Create a Gate

Create a gate in your Verlon AI dashboard:

1. Go to the [Verlon AI Dashboard](https://verlon.ai/dashboard)
2. Create a new gate with:
   - **Type**: Chat
   - **Primary Model**: Choose your preferred model (e.g., `gpt-4o`, `claude-sonnet-4-5-20250929`)
   - **Fallback Models**: Add fallback models for reliability
3. Copy the gate ID — you'll need it in the next step.

### 3. Configure Environment Variables

Create a `.env.local` file in the chatbot directory:

```bash
# Verlon AI Configuration
VERLON_API_KEY=your_api_key_here
VERLON_GATE_ID=your_gate_id_here
```

Get your API key from the [Verlon AI Dashboard](https://verlon.ai/dashboard). `VERLON_BASE_URL` is optional and defaults to `https://api.verlon.ai`.

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3005](http://localhost:3005) in your browser.

## Project Structure

```
chatbot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # Chat API endpoint using Verlon AI SDK
│   ├── layout.tsx            # Root layout with metadata
│   ├── page.tsx              # Main chat interface
│   └── globals.css           # Global styles
├── lib/
│   └── verlon.ts             # Verlon AI SDK initialization
├── .env.local                # Environment variables (create this)
├── package.json
└── README.md
```

## How It Works

### 1. User Sends Message

The user types a message in the chat interface.

### 2. API Route Processes Request

```typescript
// app/api/chat/route.ts
const result = await verlon.chat({
  gateId: process.env.VERLON_GATE_ID,
  data: {
    messages,
  },
});
```

> **Note**: Using the type-safe `verlon.chat()` method ensures compile-time validation of your request data and provides better IDE autocomplete support.

### 3. Verlon AI Handles Routing

Verlon AI:
- Routes the request to your configured primary model
- Automatically handles retries and fallbacks if needed
- Tracks cost and usage
- Returns normalized response

### 4. Display Response

The UI displays:
- AI response content
- Model that handled the request
- Cost of the request
- Latency (response time)

## Key Components

### Chat API Route (`app/api/chat/route.ts`)

Handles chat requests using the Verlon AI SDK:

```typescript
import { verlon } from '@/lib/verlon';

const result = await verlon.chat({
  gateId,
  data: { messages },
});

return NextResponse.json({
  content: result.content,
  model: result.model,
  cost: result.cost,
  latency,
});
```

### Verlon SDK Initialization (`lib/verlon.ts`)

Configures the Verlon AI client:

```typescript
import { Verlon } from '@verlon-ai/sdk';

export const verlon = new Verlon({
  apiKey: process.env.VERLON_API_KEY,
  baseUrl: process.env.VERLON_BASE_URL,
});
```

### Chat Interface (`app/page.tsx`)

React component with message history, loading states, and metadata display.

## Customization

### Change the Gate

Point the app at a different gate by updating `.env.local`:

```bash
VERLON_GATE_ID=your_other_gate_id
```

### Modify UI Styling

The UI uses Tailwind CSS. Customize colors, spacing, and layout in `app/page.tsx`.

### Add Features

Consider adding:
- Message streaming for real-time responses
- Message editing and regeneration
- Conversation export/import
- User authentication
- Conversation history persistence
- Usage monitoring via Verlon AI dashboard

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

Add your environment variables in the Vercel dashboard.

### Deploy to Other Platforms

This is a standard Next.js app and can be deployed to:
- Vercel
- Netlify
- Railway
- AWS Amplify
- Any Node.js hosting platform

## Troubleshooting

### "VERLON_API_KEY environment variable is required"

Make sure you created `.env.local` with your API key:

```bash
VERLON_API_KEY=sk-vrln-xxx
VERLON_GATE_ID=your_gate_id_here
```

### "Gate not found" or 404 errors

Ensure the gate exists in your Verlon AI dashboard and `VERLON_GATE_ID` in `.env.local` matches its ID.

### TypeScript errors

Run `pnpm install` to ensure all dependencies are installed correctly.

## Learn More

- [Verlon AI Documentation](https://docs.verlon.ai)
- [Verlon AI SDK](https://www.npmjs.com/package/@verlon-ai/sdk)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
