# Video Generation Examples

This directory contains examples for generating videos through Verlon's OpenAI-compatible `/v1/videos` endpoint using the official `openai` package. Video generation is asynchronous: each script creates a video job, polls until it completes, and downloads the result as an mp4. The gate is addressed by putting the gate ID in the `model` field.

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your Verlon API key and video gate ID
3. Install dependencies: `pnpm install`

## Examples

- `basic.ts` - Basic video generation with just a prompt
- `sizes.ts` - Video generation with custom size parameter

## Running

```bash
pnpm run basic
pnpm run sizes
```

Generated mp4 files are written to this directory (gitignored).
