# Verlon AI Examples

A collection of example applications showcasing how to use [Verlon AI](https://verlon.ai) for AI-powered features. Inference examples call Verlon through the official `openai` package against Verlon's OpenAI-compatible endpoint (`https://api.verlon.ai/v1`) with a gate ID in the `model` field; [`@verlon-ai/sdk`](https://www.npmjs.com/package/@verlon-ai/sdk) is Verlon's observability and tracing SDK (see [Agent Loops](./agent-loops)).

## Full Applications

### [AI Chatbot](./chatbot)
Modern conversational AI chatbot with message history and performance metrics, built with the official OpenAI SDK against Verlon's OpenAI-compatible endpoint. Showcases Verlon AI's smart routing, model normalization, and automatic fallback handling.

**Stack:** Next.js, TypeScript, Tailwind CSS, OpenAI SDK
**Features:** Gate-based routing, latency monitoring, dark mode

### [Content Generator](./content-generator)
AI-powered content generation for blogs, social media, and product descriptions using the OpenAI SDK, with one Verlon gate per content type. Demonstrates Verlon AI's routing, fallback strategies, and cost tracking.

**Stack:** Next.js, TypeScript, Tailwind CSS, OpenAI SDK

### [Image Generator](./image-generator)
AI-powered image generation with GPT Image, Gemini, and other models via `openai.images.generate()` against Verlon's OpenAI-compatible images endpoint.

**Stack:** Next.js, TypeScript, Tailwind CSS, OpenAI SDK
**Features:** Gate-based routing, multi-modal support, cost tracking

### [Recipe Generator](./recipe-generator)
Backend API that generates recipes from grocery lists. Express.js example using the OpenAI SDK against Verlon, demonstrating vendor-agnostic AI integration, model switching without code changes, and Firebase Functions compatibility. Perfect for understanding Verlon AI's value in production backends.

**Stack:** Express.js, TypeScript, OpenAI SDK
**Features:** Model switching without deployment, cost tracking, Firebase-ready, complete demo script

## Drop-In Provider Compatibility

### [OpenAI SDK Chatbot](./openai-chatbot)
Streaming chatbot built with the **official OpenAI SDK** pointed at Verlon's OpenAI-compatible endpoint — the canonical way to call Verlon for inference. Change the base URL and route through a gate to any model.

**Stack:** Next.js, TypeScript, OpenAI SDK

### [Agent Loops](./agent-loops)
Production-style agent loops (research orchestrator, customer support with specialist routing, document extractor) built on the Anthropic and OpenAI SDKs, demonstrating drop-in Verlon adoption: change a base URL and one header, and every agent call routes through Verlon with multi-turn session tracking. The showcase for [`@verlon-ai/sdk`](https://www.npmjs.com/package/@verlon-ai/sdk), Verlon's observability and tracing SDK — agent scopes, traced tools, and instrumented fetch. Includes session simulators for generating realistic traffic.

**Stack:** Node.js, TypeScript, Anthropic SDK, OpenAI SDK, @verlon-ai/sdk (tracing)

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
- [OpenAI SDK Compatibility Guide](https://docs.verlon.ai/provider-compatibility/openai)
- [Verlon AI SDK (observability and tracing)](https://www.npmjs.com/package/@verlon-ai/sdk)
- [Verlon AI CLI](https://www.npmjs.com/package/@verlon-ai/cli)

## Contributing

Found a bug or want to add an example? Contributions are welcome! Please open an issue or PR.

## License

MIT
