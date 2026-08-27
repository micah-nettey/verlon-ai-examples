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

// Basic chat example from documentation
const response = await openai.chat.completions.create({
  model: process.env.VERLON_GATE_ID,  // Gate UUID as model
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain quantum computing in simple terms' }
  ],
});

console.log(response.choices[0].message.content);
console.log('Model:', response.model);
console.log('Usage:', response.usage);
