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

const response = await openai.images.generate({
  model: process.env.VERLON_GATE_ID,  // Gate UUID as model
  prompt: 'A colorful abstract painting with geometric shapes',
  n: 2,
});

console.log('Generated', response.data?.length ?? 0, 'images');
for (const image of response.data ?? []) {
  console.log('URL:', image.url);
}
