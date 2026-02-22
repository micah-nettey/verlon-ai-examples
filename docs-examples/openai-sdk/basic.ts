import { config } from 'dotenv';
import OpenAI from 'openai';

config({ path: '.env', override: true });

if (!process.env.LAYER_API_KEY || !process.env.GATE_ID) {
  console.error('Error: LAYER_API_KEY and GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const openai = new OpenAI({
  baseURL: 'https://api.uselayer.ai/v1',
  apiKey: process.env.LAYER_API_KEY,
});

// @ts-ignore - gateId is a Layer AI extension
const response = await openai.chat.completions.create({
  gateId: process.env.GATE_ID,
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
});

console.log(response.choices[0].message.content);
