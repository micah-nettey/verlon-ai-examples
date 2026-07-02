# AI Content Generator

An AI-powered content generation demo built with [Verlon AI](https://verlon.ai) and Next.js.

## Features

- **Blog Post Outlines** - Generate structured blog post outlines from topics
- **Social Media Captions** - Create engaging social media content
- **Product Descriptions** - Write compelling e-commerce product descriptions
- **Automatic Type Inference** - No need to specify task type, Verlon AI uses your gate's configuration
- **Cost Tracking** - See the cost and model used for each generation
- **Smart Routing** - Automatic model selection with fallback strategies
- **Usage Tracking** - All requests tracked automatically in your Verlon AI dashboard

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Verlon AI SDK** - AI routing and completion management

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Verlon AI account ([Sign up](https://verlon.ai))
- Verlon AI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/micah-nettey/verlon-ai-examples.git
cd verlon-ai-examples/content-generator
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up gates in Verlon AI (via Dashboard or CLI), one per content type:
```bash
# Using the Verlon AI CLI
verlon gate create --name blog-outline --model gpt-4o
verlon gate create --name social-caption --model claude-sonnet-4-5
verlon gate create --name product-description --model gpt-4o-mini
```

4. Configure your environment:
```bash
# Edit .env.local and add your API key + the gate IDs from step 3
VERLON_API_KEY=your_verlon_api_key_here
NEXT_PUBLIC_VERLON_GATE_ID_BLOG=your_blog_outline_gate_id
NEXT_PUBLIC_VERLON_GATE_ID_SOCIAL=your_social_caption_gate_id
NEXT_PUBLIC_VERLON_GATE_ID_PRODUCT=your_product_description_gate_id
```

`VERLON_BASE_URL` is optional and defaults to `https://api.verlon.ai`.

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## How It Works

This example demonstrates Verlon AI's key features:

1. **Gate-based routing** - Each content type uses a different gate with optimized models
2. **Automatic type inference** - Task type is automatically inferred from the gate's `taskType` configuration
3. **Fallback strategies** - If primary model fails, automatically tries backup models
4. **Cost tracking** - Every request logs cost, latency, and tokens used
5. **Metadata display** - See which model was actually used for each request
6. **Usage tracking** - All requests are automatically tracked in your Verlon AI dashboard

### Type-Safe API

Use the type-safe `verlon.chat()` method for compile-time validation:

```typescript
// Type-safe method with IDE autocomplete and validation
const result = await verlon.chat({
  gateId: 'your-gate-id',
  data: {
    messages: [
      { role: 'user', content: prompt }
    ],
  },
});
```

## Project Structure

```
content-generator/
├── app/
│   ├── api/
│   │   └── generate/route.ts    # API route for Verlon AI completions
│   ├── page.tsx                 # Main UI with content-type tabs
│   └── layout.tsx               # App layout
└── lib/
    └── verlon.ts                # Verlon AI client setup
```

## Learn More

- [Verlon AI Documentation](https://docs.verlon.ai)
- [Verlon AI SDK](https://www.npmjs.com/package/@verlon-ai/sdk)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
