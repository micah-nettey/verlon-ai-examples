# Recipe Generator with Verlon AI

A backend API that generates recipes from grocery lists using Verlon AI. This Express.js example uses the official OpenAI SDK against Verlon AI's OpenAI-compatible endpoint, demonstrating vendor-agnostic AI integration, model switching without code changes, and Firebase Functions compatibility.

![Verlon AI](https://img.shields.io/badge/Verlon%20AI-Recipe%20Generator-blue)
![Express.js](https://img.shields.io/badge/Express.js-5.1-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Features

- **Smart Recipe Generation** - Generate creative recipes from any ingredient list
- **Model Switching** - Switch between GPT-4, Claude, Gemini without code changes
- **Real-time Metrics** - Track model used and latency for each request
- **Firebase-Ready** - 3-line adaptation to Firebase Functions (guide below)
- **Production-Ready** - Express.js backend with proper error handling and CORS
- **Cost Tracking** - Monitor AI costs per request in the Verlon AI dashboard

## What This Demo Showcases

This recipe generator demonstrates Verlon AI's core value propositions:

1. **Vendor Lock-in Solution**: Switch AI providers instantly via dashboard - no code changes or redeployments
2. **Drop-in OpenAI SDK Compatibility**: The official `openai` package works unchanged against `https://api.verlon.ai/v1`
3. **Model Experimentation**: Test GPT-4, Claude, Gemini side-by-side to find the best fit
4. **Automatic Fallbacks**: If primary model fails, Verlon AI routes to fallback models
5. **Usage Analytics**: All requests tracked in Verlon AI dashboard with cost and performance metrics

## Prerequisites

- Node.js 18+ and pnpm
- A Verlon AI account ([Sign up](https://verlon.ai))
- Verlon AI API key

## Setup

### 1. Clone and Install

```bash
# Navigate to the recipe-generator directory
cd recipe-generator

# Install dependencies
pnpm install
```

### 2. Create a Gate

Create a gate in your Verlon AI dashboard:

1. Go to the [Verlon AI Dashboard](https://verlon.ai/dashboard)
2. Create a new gate with:
   - **Name**: `recipe-generation` (or your custom name)
   - **Type**: Chat
   - **Primary Model**: Choose your preferred model (e.g., `gpt-4o`, `claude-sonnet-4-5-20250929`, `gemini-2.0-flash`)
   - **Fallback Models**: Add fallback models for reliability
3. Copy the gate ID — you'll need it in the next step.

### 3. Configure Environment Variables

Update the `.env.local` file in the recipe-generator directory:

```bash
# Verlon AI Configuration
VERLON_API_KEY=your_api_key_here
VERLON_GATE_ID=your_gate_id_here

# Server Configuration (optional)
PORT=3000
```

Get your API key from the [Verlon AI Dashboard](https://verlon.ai/dashboard). `VERLON_BASE_URL` is optional and defaults to `https://api.verlon.ai` (the `/v1` suffix is added in code).

### 4. Run the Development Server

```bash
pnpm dev
```

The API will be running at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
recipe-generator/
├── src/
│   ├── index.ts              # Express server calling Verlon AI via the OpenAI SDK
│   └── lib/
│       └── verlon.ts         # OpenAI client configured for Verlon AI
├── .env.local                # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

### Generate a Recipe

**Request:**

```bash
curl -X POST http://localhost:3000/recipe \
  -H "Content-Type: application/json" \
  -d '{
    "groceryList": ["chicken breast", "spinach", "garlic", "olive oil", "lemon"]
  }'
```

**Response:**

```json
{
  "recipe": "# Lemon Garlic Chicken with Spinach\n\n## Prep Time: 10 minutes\n## Cook Time: 20 minutes\n## Difficulty: Easy\n\n### Ingredients:\n- 2 chicken breasts\n- 2 cups fresh spinach\n- 3 cloves garlic, minced\n- 2 tbsp olive oil\n- 1 lemon (juice and zest)\n\n### Instructions:\n1. Season chicken with salt and pepper...",
  "metadata": {
    "model": "gpt-4o",
    "latency": "1847ms",
    "ingredients": ["chicken breast", "spinach", "garlic", "olive oil", "lemon"]
  }
}
```

### Health Check

```bash
curl http://localhost:3000/health
```

## How It Works

### 1. Client Sends Grocery List

Your application sends a POST request with an array of ingredients:

```typescript
fetch('http://localhost:3000/recipe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    groceryList: ['chicken', 'broccoli', 'rice'],
  }),
});
```

### 2. Express Server Processes Request

```typescript
// src/index.ts
const completion = await openai.chat.completions.create({
  model: process.env.VERLON_GATE_ID, // Verlon gate ID picks the actual model
  messages: [
    {
      role: 'user',
      content: `Generate a delicious recipe using these ingredients: ${groceryList.join(', ')}`,
    },
  ],
});

const recipe = completion.choices[0]?.message?.content;
```

### 3. Verlon AI Handles Routing

Verlon AI:
- Resolves the gate from the `model` field
- Routes the request to your configured primary model
- Automatically handles retries and fallbacks if needed
- Tracks cost and usage
- Returns an OpenAI-shaped response

### 4. Response Includes Metadata

The API returns the recipe content plus metadata about the request (model, latency).

## Adapting to Firebase Functions

This Express.js code adapts to Firebase Functions with minimal changes:

**Express version (current):**

```typescript
// src/index.ts
app.post('/recipe', async (req: Request, res: Response) => {
  const { groceryList } = req.body;
  const completion = await openai.chat.completions.create({
    model: process.env.VERLON_GATE_ID,
    messages,
  });
  res.json({ recipe: completion.choices[0]?.message?.content, metadata: { ... } });
});
```

**Firebase Functions version:**

```typescript
// functions/src/index.ts
import { onRequest } from 'firebase-functions/v2/https';
import { openai } from './lib/verlon';

export const generateRecipe = onRequest(async (req, res) => {
  const { groceryList } = req.body;
  const completion = await openai.chat.completions.create({
    model: process.env.VERLON_GATE_ID,
    messages,
  });
  res.json({ recipe: completion.choices[0]?.message?.content, metadata: { ... } });
});
```

**Key differences:**
- Import `onRequest` from Firebase Functions v2
- Wrap handler with `onRequest()` instead of `app.post()`
- Keep the exact same Verlon AI integration code (no changes!)

The `openai` client initialization in `lib/verlon.ts` stays identical.

## Demo Script for Client Presentation

### Setup (Before Demo)

1. Start the API: `pnpm dev`
2. Open Verlon AI Dashboard: Show gates page
3. Prepare curl command or Postman/Insomnia request
4. Have 2-3 ingredient lists ready (simple to complex)

### Demo Flow (15-30 minutes)

**1. Introduction (2 min)**
- "Today I'm showing you Verlon AI - it solves vendor lock-in for AI models"
- "We'll build a recipe generator, but this applies to any AI use case"

**2. Show the Problem (3 min)**
- "Normally, switching from GPT-4 to Claude requires:"
  - Code changes (import different SDK)
  - Testing
  - Deployment
  - Rollback plan if it fails
- "What if you want to experiment with 3 models? That's 3 deployments"

**3. Live Demo - First Request (5 min)**
- Send request with simple ingredients: `["chicken", "rice", "vegetables"]`
- Show response: recipe + metadata (model, latency)
- Highlight the cost of the request in the Verlon AI dashboard

**4. Switch Models Live (5 min)**
- Open Verlon AI Dashboard
- Switch gate to Claude Sonnet
- Send SAME request again (no code changes!)
- Show response: different recipe, different model
- **Key Point**: "No deployment. No code change. Just clicked a button."

**5. Show Dashboard Analytics (3 min)**
- Navigate to Analytics/Logs page
- Show both requests logged
- Cost comparison
- Latency comparison
- "Now you can make data-driven decisions about which model to use"

**6. Explain Fallbacks (2 min)**
- Show gate configuration with fallback models
- "If GPT-4 is down, it automatically tries Claude, then Gemini"
- "You never write fallback code - it's automatic"

**7. Firebase Adaptation (3 min)**
- Show the 3-line diff in README
- "The Verlon AI code stays identical - just change the wrapper"
- "Works with Express, Firebase, AWS Lambda, any Node.js environment"

**8. Pricing Discussion (2 min)**
- "You pay Verlon AI $29-99/month + actual model costs"
- "But you save:"
  - Engineering time (no SDK switching code)
  - Testing time (no redeployment risk)
  - Opportunity cost (experiment faster)

**9. Q&A (5+ min)**
- Common questions:
  - "What if Verlon AI goes down?" - Direct API fallback option
  - "Can we self-host?" - Not currently, but data never stored
  - "What models are supported?" - OpenAI, Anthropic, Google, Mistral, more coming
  - "Does this work with streaming?" - Yes (not shown in this demo)

### Key Talking Points

- **Vendor Lock-in Solution**: Switch providers without code changes
- **Experimentation**: Test models side-by-side with production traffic
- **Cost Optimization**: Track costs per request, switch to cheaper models
- **Reliability**: Automatic fallbacks across providers
- **Analytics**: Built-in cost and performance tracking
- **Universal**: Works with any Node.js backend (Express, Firebase, Lambda)

### Demo Tips

- Have backup curl commands ready in case of network issues
- Show 2-3 model switches to really drive the point home
- Use ingredient lists they can relate to (their favorite meals)
- Emphasize "no deployment" repeatedly - this is the killer feature
- If they ask about their specific use case, translate recipe to their domain

## Customization

### Change the Gate

Update `VERLON_GATE_ID` in `.env.local`:

```bash
VERLON_GATE_ID=your_other_gate_id
```

### Add a System Prompt

Customize the recipe generation style in `src/index.ts`:

```typescript
messages: [
  {
    role: 'system',
    content: 'Your custom instructions for recipe generation...',
  },
  {
    role: 'user',
    content: `Generate a delicious recipe using these ingredients: ...`,
  },
],
```

### Add More Endpoints

Add additional endpoints for different use cases:

```typescript
app.post('/meal-plan', async (req, res) => {
  // Generate weekly meal plans
});

app.post('/nutrition', async (req, res) => {
  // Calculate nutrition info
});
```

## Deployment

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Deploy to Render

1. Create new Web Service
2. Connect your Git repository
3. Set build command: `pnpm build`
4. Set start command: `pnpm start`
5. Add environment variables

### Deploy to AWS Lambda

Use [Serverless Framework](https://www.serverless.com/) or AWS CDK to deploy as Lambda function.

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

### Port already in use

Change the port in `.env.local`:

```bash
PORT=3001
```

## Learn More

- [Verlon AI Documentation](https://docs.verlon.ai)
- [OpenAI SDK Compatibility Guide](https://docs.verlon.ai/provider-compatibility/openai)
- [Express.js Documentation](https://expressjs.com/)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)

## License

MIT
