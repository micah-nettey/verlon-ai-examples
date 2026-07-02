# Verlon AI Examples

A collection of example applications showcasing how to use [Verlon AI](https://verlon.ai) for AI-powered features.

## Full Applications

### [AI Chatbot](./chatbot)
Modern conversational AI chatbot with message history, real-time cost tracking, and performance metrics. Showcases Verlon AI's smart routing, model normalization, automatic fallback handling, and simplified API with automatic task type inference.

**Stack:** Next.js, TypeScript, Tailwind CSS
**Features:** Gate-based routing, automatic type inference, cost tracking, latency monitoring, dark mode

### [Content Generator](./content-generator)
AI-powered content generation for blogs, social media, and product descriptions. Demonstrates Verlon AI's routing, fallback strategies, cost tracking, and simplified request API.

**Stack:** Next.js, TypeScript, Tailwind CSS

### [Image Generator](./image-generator)
AI-powered image generation with GPT Image, Gemini, and other models. Shows how Verlon AI automatically infers task type from gate configuration, eliminating the need to specify type in requests.

**Stack:** Next.js, TypeScript, Tailwind CSS
**Features:** Automatic type inference, multi-modal support, cost tracking

### [Recipe Generator](./recipe-generator)
Backend API that generates recipes from grocery lists. Express.js example demonstrating vendor-agnostic AI integration, model switching without code changes, and Firebase Functions compatibility. Perfect for understanding Verlon AI's value in production backends.

**Stack:** Express.js, TypeScript
**Features:** Model switching without deployment, cost tracking, Firebase-ready, complete demo script

## Drop-In Provider Compatibility

### [OpenAI SDK Chatbot](./openai-chatbot)
Streaming chatbot built with the **official OpenAI SDK** pointed at Verlon's OpenAI-compatible endpoint. No Verlon SDK required — change the base URL and route through a gate to any model.

**Stack:** Next.js, TypeScript, OpenAI SDK

### [Agent Loops](./agent-loops)
Production-style agent loops (research orchestrator, customer support with specialist routing, document extractor) built on the Anthropic and OpenAI SDKs, demonstrating drop-in Verlon adoption: change a base URL and one header, and every agent call routes through Verlon with multi-turn session tracking. Includes session simulators for generating realistic traffic.

**Stack:** Node.js, TypeScript, Anthropic SDK, OpenAI SDK

## Tooling Quickstarts

### [CLI Quickstart](./cli-quickstart)
The smallest possible project for trying out [`@verlon-ai/cli`](https://www.npmjs.com/package/@verlon-ai/cli) — authenticate, manage gates, tail logs, and pipe JSON output into scripts and coding agents.

### [MCP Quickstart](./mcp-quickstart)
Connect AI assistants to your Verlon account via the Model Context Protocol server [`@verlon-ai/mcp`](https://www.npmjs.com/package/@verlon-ai/mcp), with configs for Claude Code, Claude Desktop, and Cursor.

## Documentation Examples

### [docs-examples](./docs-examples)
Runnable verification projects for every code sample in the [Verlon AI documentation](https://docs.verlon.ai): SDK quickstart, chat, audio, images, and video, plus OpenAI SDK (TypeScript and Python) and Anthropic SDK compatibility examples.

## B2B Platform Samples

### [AgentForge Platform](./agentforge-platform)
Mock B2B platform where each customer builds custom multi-step agents — reference UI for per-user agent fleets, usage rollups, and per-step cost attribution.

**Stack:** Next.js, TypeScript

### [HelpBot Platform](./helpbot-platform)
Mock B2B support-bot platform — reference UI for per-customer bot fleets and usage dashboards.

**Stack:** Next.js, TypeScript

---

## Getting Started

Each example is a standalone project. Navigate to the example directory and follow its README for setup instructions.

```bash
# Clone this repository
git clone https://github.com/micah-nettey/verlon-ai-examples.git

# Navigate to an example
cd verlon-ai-examples/content-generator

# Follow the example's README
```

## Prerequisites

- Node.js 18+ and pnpm
- A Verlon AI account ([Sign up](https://verlon.ai))
- Verlon AI API key from your [dashboard](https://verlon.ai/dashboard)

## Learn More

- [Verlon AI Documentation](https://docs.verlon.ai)
- [Verlon AI SDK](https://www.npmjs.com/package/@verlon-ai/sdk)
- [Verlon AI CLI](https://www.npmjs.com/package/@verlon-ai/cli)

## Contributing

Found a bug or want to add an example? Contributions are welcome! Please open an issue or PR.

## License

MIT
