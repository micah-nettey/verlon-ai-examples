# Documentation Examples

This directory contains test examples that verify the code samples in the [Layer AI documentation](https://docs.uselayer.ai).

## Purpose

These examples ensure that:
- All code snippets in the documentation are accurate and working
- The instructions we provide to users are correct
- Breaking changes are caught before documentation is published

## Examples

### [Quickstart](./quickstart)
Tests the code from [Getting Started > Quickstart](https://docs.uselayer.ai/getting-started/quickstart)
- Layer SDK installation and basic usage
- Making your first chat request

### [OpenAI SDK Integration](./openai-sdk)
Tests the code from [Integrations > OpenAI SDK](https://docs.uselayer.ai/integrations/openai-sdk)
- Basic OpenAI SDK configuration with Layer
- Streaming responses
- All three gate specification methods (gateId, model, header)

## Running the Examples

Each example has its own README with specific instructions. General steps:

1. Navigate to the example directory
2. Copy `.env.example` to `.env`
3. Fill in your Layer AI credentials
4. Run `pnpm install`
5. Run the example scripts

## Prerequisites

- Layer AI account ([Sign up](https://uselayer.ai/signup))
- Layer API key from [Dashboard](https://uselayer.ai/dashboard)
- A configured gate with a model
