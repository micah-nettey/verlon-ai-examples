# SDK Image Generation Examples

This example demonstrates image generation through Verlon AI using the official `openai` package, as documented in the Verlon AI documentation.

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your credentials in `.env`:
- `VERLON_API_KEY`: Your Verlon API key from https://verlon.ai/dashboard
- `VERLON_GATE_ID`: Your image generation gate UUID from the dashboard

3. Install dependencies:
```bash
pnpm install
```

## Run Examples

### Basic Image Generation
```bash
pnpm basic
```

### Image with Custom Size and Quality
```bash
pnpm sizes
```

### Generate Multiple Images
```bash
pnpm multiple
```

## What This Verifies

From [/sdk-reference/images](/sdk-reference/images):
- ✓ `openai.images.generate()` with the gate UUID as `model`
- ✓ Basic image generation
- ✓ Custom image sizes (1024x1024)
- ✓ Quality settings (hd)
- ✓ Generating multiple images (n parameter)
- ✓ Response structure (`response.data[].url`)
