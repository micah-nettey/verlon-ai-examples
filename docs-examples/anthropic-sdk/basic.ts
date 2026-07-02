import { config } from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

config({ path: '.env', override: true });

if (!process.env.VERLON_API_KEY || !process.env.VERLON_GATE_ID) {
  console.error('Error: VERLON_API_KEY and VERLON_GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const anthropic = new Anthropic({
  baseURL: 'https://api.verlon.ai',
  apiKey: process.env.VERLON_API_KEY,
});

// @ts-ignore - gateId is a Verlon AI extension
const response = await anthropic.messages.create({
  gateId: process.env.VERLON_GATE_ID,
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
});

const firstBlock = response.content[0];
if (firstBlock && firstBlock.type === 'text') {
  console.log(firstBlock.text);
}
