import { config } from 'dotenv';
import OpenAI from 'openai';

config({ path: '.env', override: true });

if (!process.env.VERLON_API_KEY || !process.env.VERLON_GATE_ID) {
  console.error('Error: VERLON_API_KEY and VERLON_GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

console.log('Testing all three gate specification methods from docs...\n');

// Method 1: Using gateId (Recommended)
console.log('1. Testing gateId method:');
const openai1 = new OpenAI({
  baseURL: 'https://api.verlon.ai/v1',
  apiKey: process.env.VERLON_API_KEY,
});

// @ts-ignore - gateId is a Verlon AI extension
const response1 = await openai1.chat.completions.create({
  gateId: process.env.VERLON_GATE_ID,
  messages: [
    { role: 'user', content: 'Say "Method 1 works"' }
  ],
});
console.log('Response:', response1.choices[0].message.content);
console.log('');

// Method 2: Using model field
console.log('2. Testing model field method:');
const openai2 = new OpenAI({
  baseURL: 'https://api.verlon.ai/v1',
  apiKey: process.env.VERLON_API_KEY,
});

const response2 = await openai2.chat.completions.create({
  model: process.env.VERLON_GATE_ID as string,  // Gate UUID as model
  messages: [
    { role: 'user', content: 'Say "Method 2 works"' }
  ],
});
console.log('Response:', response2.choices[0].message.content);
console.log('');

// Method 3: Using header
console.log('3. Testing header method:');
const openai3 = new OpenAI({
  baseURL: 'https://api.verlon.ai/v1',
  apiKey: process.env.VERLON_API_KEY,
  defaultHeaders: {
    'X-Verlon-Gate-Id': process.env.VERLON_GATE_ID,
  },
});

// @ts-ignore - model is required by OpenAI SDK types, but Verlon accepts header
const response3 = await openai3.chat.completions.create({
  messages: [
    { role: 'user', content: 'Say "Method 3 works"' }
  ],
});
console.log('Response:', response3.choices[0].message.content);
console.log('');

console.log('All methods tested successfully!');
