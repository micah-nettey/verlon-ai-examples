import { config } from 'dotenv';
import OpenAI from 'openai';

config({ path: '.env', override: true });

if (!process.env.VERLON_API_KEY || !process.env.VERLON_GATE_ID) {
  console.error('Error: VERLON_API_KEY and VERLON_GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.VERLON_API_KEY,
  baseURL: 'https://api.verlon.ai/v1',
});

// Streaming example from documentation
const stream = await openai.chat.completions.create({
  model: process.env.VERLON_GATE_ID,  // Gate UUID as model
  messages: [
    { role: 'user', content: 'Write a poem about the ocean' }
  ],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
console.log('\n');
