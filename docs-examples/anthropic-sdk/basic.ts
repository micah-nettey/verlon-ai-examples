import { config } from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

config({ path: '.env', override: true });

if (!process.env.LAYER_API_KEY || !process.env.GATE_ID) {
  console.error('Error: LAYER_API_KEY and GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const anthropic = new Anthropic({
  baseURL: 'https://api.uselayer.ai',
  apiKey: process.env.LAYER_API_KEY,
});

// @ts-ignore - gateId is a Layer AI extension
const response = await anthropic.messages.create({
  gateId: process.env.GATE_ID,
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
});

const firstBlock = response.content[0];
if (firstBlock && firstBlock.type === 'text') {
  console.log(firstBlock.text);
}
