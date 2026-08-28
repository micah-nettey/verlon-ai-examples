import { config } from 'dotenv';
import OpenAI from 'openai';
import { writeFile } from 'node:fs/promises';

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

let video = await openai.videos.create({
  model: process.env.VERLON_GATE_ID,
  prompt: 'A cute robot walking through a futuristic city',
  seconds: '4',
  size: '1280x720',
});

console.log('Video job created:', video.id);

while (video.status === 'queued' || video.status === 'in_progress') {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  video = await openai.videos.retrieve(video.id);
  console.log('Status:', video.status, `(${video.progress}%)`);
}

if (video.status === 'failed') {
  console.error('Video generation failed:', video.error?.message);
  process.exit(1);
}

const content = await openai.videos.downloadContent(video.id);
await writeFile('sizes.mp4', Buffer.from(await content.arrayBuffer()));

console.log('Video with custom size generated successfully!');
console.log('Saved to:', 'sizes.mp4');
console.log('Size:', video.size);
console.log('Model:', video.model);
