# SDK Audio/TTS Examples

This directory contains examples for text-to-speech generation through Verlon AI using the official `openai` package's `audio.speech.create()` method. Each example writes the generated audio to an `.mp3` file in this directory.

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your Verlon API key and gate ID
3. Install dependencies: `pnpm install`

## Examples

- `basic.ts` - Basic text-to-speech conversion (writes `speech.mp3`)
- `voices.ts` - Using different voice options (writes `speech-alloy.mp3`)
- `formats.ts` - Audio format and speed configuration (writes `speech-formatted.mp3`)

## Running

```bash
pnpm basic
pnpm voices
pnpm formats
```
