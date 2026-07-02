# AI Image Generator with Verlon AI

An AI-powered image generation demo built with [Verlon AI](https://verlon.ai) and Next.js. This example showcases Verlon AI's **automatic task type inference** feature - no need to specify the request type!

![Verlon AI Image Generator](https://img.shields.io/badge/Verlon%20AI-Image%20Generator-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Features

- 🎨 **AI Image Generation** - Create images from text prompts using GPT Image, Gemini, and other models
- 🔄 **Automatic Type Inference** - No need to specify `type: 'image'` - Verlon AI infers it from your gate's `taskType`
- 🚀 **Smart Routing** - Automatic model selection and fallback handling
- 💰 **Cost Tracking** - See the exact cost of each image generation
- ⚡ **Fast Performance** - Built with Next.js 16 and modern React
- 📊 **Usage Tracking** - All requests automatically tracked in your Verlon AI dashboard

## What This Demo Showcases

This example demonstrates Verlon AI's **type-safe methods with compile-time validation**:

### Legacy Way (`complete()`)
```typescript
const result = await verlon.complete({
  gateId: 'your-gate-id',
  type: 'image', // ❌ Required - repetitive and error-prone
  data: {
    prompt: 'A sunset over mountains',
  },
});
```

### Type-Safe Way (`image()`)
```typescript
const result = await verlon.image({
  gateId: 'your-gate-id',
  data: {
    prompt: 'A sunset over mountains',
  },
});
```

**Benefits:**
- Type-safe requests with compile-time validation
- IDE autocomplete for all parameters
- Cleaner, more intuitive API
- Catches errors before runtime

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
   - **Task Type**: `image` ⭐ **This is key - Verlon AI will automatically use this!**
   - **Primary Model**: Choose an image model (e.g., `gpt-image-1`)
   - **Fallback Models**: Add fallback image models for reliability
3. Copy the gate ID — you'll need it in the next step.

> **Important**: Setting the gate's `taskType` to `image` tells Verlon AI that all requests to this gate are for image generation. You don't need to specify `type: 'image'` in your code!

### 3. Configure Environment Variables

Create a `.env.local` file in the image-generator directory:

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

Open [http://localhost:3006](http://localhost:3006) in your browser.

## Project Structure

```
image-generator/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # Image generation API endpoint
│   ├── layout.tsx            # Root layout with metadata
│   ├── page.tsx              # Main image generator interface
│   └── globals.css           # Global styles
├── lib/
│   └── verlon.ts             # Verlon AI SDK initialization
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
const result = await verlon.image({
  gateId: process.env.VERLON_GATE_ID,
  data: {
    prompt: userPrompt,
  },
});
```

Notice we're using the **type-safe `verlon.image()`** method! This provides:
- Compile-time type checking for image-specific parameters
- IDE autocomplete for all valid options
- Better error messages if you pass invalid data

### 3. Verlon AI Handles Everything

Verlon AI:
- Uses the gate's `taskType` to determine this is an image request
- Routes to your configured image generation model
- Handles retries and fallbacks automatically
- Tracks cost and usage
- Returns the generated image URL

### 4. Display Result

The UI displays:
- Generated image
- Model that handled the request
- Cost of the generation
- Image URL for downloading

## Key Components

### Image Generation API Route (`app/api/generate/route.ts`)

Handles image generation using the Verlon AI SDK:

```typescript
import { verlon } from '@/lib/verlon';

const result = await verlon.image({
  gateId: process.env.VERLON_GATE_ID,
  data: {
    prompt: userPrompt,
    size: '1024x1024',
    quality: 'standard',
  },
});

return NextResponse.json({
  imageUrl: result.content,
  model: result.model,
  cost: result.cost,
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

### Image Generator Interface (`app/page.tsx`)

React component with prompt input, loading states, and image display.

## Customization

### Change the Gate

Update the gate ID in your environment variables:

```bash
VERLON_GATE_ID=your-custom-gate-id
```

Or pass it directly in the code:

```typescript
const result = await verlon.image({
  gateId: 'your-custom-gate-id',
  data: { prompt },
});
```

### Modify Image Parameters

Add custom parameters to the request:

```typescript
const result = await verlon.image({
  gateId: process.env.VERLON_GATE_ID,
  data: {
    prompt: userPrompt,
    size: '1792x1024',      // Different size
    quality: 'hd',          // Higher quality
    style: 'vivid',         // vivid or natural style
  },
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
- [Verlon AI SDK](https://www.npmjs.com/package/@verlon-ai/sdk)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
