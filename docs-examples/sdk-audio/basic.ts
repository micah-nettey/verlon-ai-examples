import { config } from 'dotenv';
import { writeFileSync } from 'node:fs';
import OpenAI from 'openai';

config({ override: true });

if (!process.env.VERLON_API_KEY || !process.env.VERLON_GATE_ID) {
  console.error('Error: VERLON_API_KEY and VERLON_GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.VERLON_API_KEY,
  baseURL: 'https://api.verlon.ai/v1',
});

const response = await openai.audio.speech.create({
  model: process.env.VERLON_GATE_ID,  // Gate UUID as model
  voice: 'alloy',
  input: 'Hello! Welcome to Verlon AI text-to-speech. This is a basic example of converting text to audio.',
});

const audio = Buffer.from(await response.arrayBuffer());
writeFileSync('speech.mp3', audio);

console.log('Audio generated successfully!');
console.log('Saved to: speech.mp3');
console.log('Bytes:', audio.length);
