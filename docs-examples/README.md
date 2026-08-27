# Documentation Examples

This directory contains test examples that verify the code samples in the [Verlon AI documentation](https://docs.verlon.ai).

## Purpose

These examples ensure that:
- All code snippets in the documentation are accurate and working
- The instructions we provide to users are correct
- Breaking changes are caught before documentation is published

## Examples

### Verlon Gateway (official `openai` package)

- **[Quickstart](./quickstart)** — your first chat request through the OpenAI-format gateway
- **[SDK Chat](./sdk-chat)** — basic and streaming chat completions
- **[SDK Audio](./sdk-audio)** — text-to-speech with voice, format, and speed options
- **[SDK Images](./sdk-images)** — image generation with sizes and multiple outputs

### Verlon SDK

- **[SDK Video](./sdk-video)** — video generation with size options

### Provider SDK Compatibility (no Verlon SDK required)

- **[OpenAI SDK](./openai-sdk)** — the official OpenAI SDK against `https://api.verlon.ai/v1`, including streaming and all three gate specification methods (`gateId`, `model` field, `X-Verlon-Gate-Id` header)
- **[Anthropic SDK](./anthropic-sdk)** — the official Anthropic SDK against `https://api.verlon.ai`, basic and streaming
- **[OpenAI SDK (Python)](./openai-sdk-python-chat)** — the OpenAI Python SDK, basic and streaming chat

## Running the Examples

Each example has its own README with specific instructions. General steps:

1. Navigate to the example directory
2. Copy `.env.example` to `.env`
3. Fill in your Verlon AI credentials
4. Run `pnpm install` (or `pip install -r requirements.txt` for Python)
5. Run the example scripts

## Prerequisites

- Verlon AI account ([Sign up](https://verlon.ai/signup))
- Verlon API key from the [Dashboard](https://verlon.ai/dashboard)
- A configured gate with a model
