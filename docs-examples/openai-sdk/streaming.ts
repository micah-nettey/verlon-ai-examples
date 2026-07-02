import { config } from 'dotenv';
import OpenAI from 'openai';

config({ path: '.env', override: true });

if (!process.env.VERLON_API_KEY || !process.env.VERLON_GATE_ID) {
  console.error('Error: VERLON_API_KEY and VERLON_GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const openai = new OpenAI({
  baseURL: 'https://api.verlon.ai/v1',
  apiKey: process.env.VERLON_API_KEY,
});

// @ts-ignore - gateId is a Verlon AI extension
const stream = await openai.chat.completions.create({
  gateId: process.env.VERLON_GATE_ID,
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Tell me a joke.' }
  ],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  process.stdout.write(content);
}

console.log('\n');
