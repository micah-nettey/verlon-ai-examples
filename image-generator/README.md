# AI Image Generator with Verlon AI

An AI-powered image generation demo built with [Verlon AI](https://verlon.ai) and Next.js. This example calls Verlon AI's OpenAI-compatible images endpoint with the official OpenAI SDK — `openai.images.generate()` works unchanged, with a Verlon gate ID in the `model` field.

![Verlon AI Image Generator](https://img.shields.io/badge/Verlon%20AI-Image%20Generator-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Features

- **AI Image Generation** - Create images from text prompts using GPT Image, Gemini, and other models
- **Drop-in OpenAI SDK Compatibility** - `openai.images.generate()` against `https://api.verlon.ai/v1`
- **Smart Routing** - Automatic model selection and fallback handling
- **Fast Performance** - Built with Next.js 16 and modern React
- **Usage Tracking** - All requests automatically tracked in your Verlon AI dashboard

## What This Demo Showcases

The official OpenAI SDK's images API pointed at Verlon AI:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.VERLON_API_KEY,
  baseURL: 'https://api.verlon.ai/v1',
});

const result = await openai.images.generate({
  model: 'your-gate-id', // Verlon gate ID — the gate config picks the image model
  prompt: 'A sunset over mountains',
  n: 1,
});
```

**Benefits:**
- No Verlon-specific SDK to learn — your existing OpenAI image code just works
- Switch the gate to a different image model in the dashboard; the code never changes
- Automatic fallbacks, cost tracking, and usage analytics handled by Verlon AI

## Prerequisites

- Node.js 18+ and pnpm
- A Verlon AI account ([Sign up](https://verlon.ai))
- Verlon AI API key

## Setup

### 1. Clone and Install

```bash
# Navigate to the image-generator directory
cd image-generator

# Install dependencies
pnpm install
```

### 2. Create an Image Generation Gate

Create a gate in your Verlon AI dashboard:

1. Go to the [Verlon AI Dashboard](https://verlon.ai/dashboard)
2. Create a new gate with:
   - **Name**: `image-generator` (or your custom name)
   - **Task Type**: `image`
   - **Primary Model**: Choose an image model (e.g., `gpt-image-1`)
   - **Fallback Models**: Add fallback image models for reliability
3. Copy the gate ID — you'll need it in the next step.

### 3. Configure Environment Variables

Create a `.env.local` file in the image-generator directory:

```bash
# Verlon AI Configuration
VERLON_API_KEY=your_api_key_here
VERLON_GATE_ID=your_gate_id_here
```

Get your API key from the [Verlon AI Dashboard](https://verlon.ai/dashboard). `VERLON_BASE_URL` is optional and defaults to `https://api.verlon.ai` (the `/v1` suffix is added in code).

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3006](http://localhost:3006) in your browser.

## Project Structure

```
image-generator/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # Image generation API endpoint using the OpenAI SDK
│   ├── layout.tsx            # Root layout with metadata
│   ├── page.tsx              # Main image generator interface
│   └── globals.css           # Global styles
├── lib/
│   └── verlon.ts             # OpenAI client configured for Verlon AI
├── .env.local                # Environment variables (create this)
├── package.json
└── README.md
```

## How It Works

### 1. User Enters Prompt

The user types an image description in the text area.

### 2. API Route Processes Request

```typescript
// app/api/generate/route.ts
const result = await openai.images.generate({
  model: process.env.VERLON_GATE_ID,
  prompt: userPrompt,
  n: 1,
});

const firstImage = result.data?.[0];
const imageUrl = firstImage?.url ||
  (firstImage?.b64_json ? `data:image/png;base64,${firstImage.b64_json}` : undefined);
```

### 3. Verlon AI Handles Everything

Verlon AI:
- Resolves the gate from the `model` field
- Routes to your configured image generation model
- Handles retries and fallbacks automatically
- Tracks cost and usage
- Returns an OpenAI-shaped images response (`data[0].url` or `data[0].b64_json`)

### 4. Display Result

The UI displays:
- Generated image
- Generation latency
- Image URL for downloading

## Key Components

### Image Generation API Route (`app/api/generate/route.ts`)

Handles image generation using the OpenAI SDK against Verlon AI.

### OpenAI Client Initialization (`lib/verlon.ts`)

Configures the OpenAI client against Verlon AI's OpenAI-compatible endpoint:

```typescript
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.VERLON_API_KEY,
  baseURL: 'https://api.verlon.ai/v1',
});
```

### Image Generator Interface (`app/page.tsx`)

React component with prompt input, loading states, and image display.

## Customization

### Change the Gate

Update the gate ID in your environment variables:

```bash
VERLON_GATE_ID=your-custom-gate-id
```

### Modify Image Parameters

Add standard OpenAI image parameters to the request:

```typescript
const result = await openai.images.generate({
  model: process.env.VERLON_GATE_ID,
  prompt: userPrompt,
  n: 1,
  size: '1792x1024',      // Different size
  quality: 'hd',          // Higher quality
});
```

### Add Advanced Features

Consider adding:
- Image editing and variations
- Multiple images per request
- Style presets
- Image history gallery
- Download functionality
- Prompt suggestions

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

Add your environment variables in the Vercel dashboard.

## Troubleshooting

### "VERLON_API_KEY environment variable is required"

Make sure you created `.env.local` with your API key:

```bash
VERLON_API_KEY=sk-vrln-xxx
VERLON_GATE_ID=your_gate_id_here
```

### "Gate not found" or 404 errors

Ensure:
1. You created a gate in your Verlon AI dashboard
2. The gate's `taskType` is set to `image`
3. Your gate ID is correct in the environment variables

### TypeScript errors

Run `pnpm install` to ensure all dependencies are installed correctly.

## Learn More

- [Verlon AI Documentation](https://docs.verlon.ai)
- [OpenAI SDK Compatibility Guide](https://docs.verlon.ai/provider-compatibility/openai)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
