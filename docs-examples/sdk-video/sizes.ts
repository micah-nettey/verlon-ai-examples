import { config } from 'dotenv';
import { Verlon } from '@verlon-ai/sdk';

config({ path: '.env', override: true });

if (!process.env.VERLON_API_KEY || !process.env.VERLON_GATE_ID) {
  console.error('Error: VERLON_API_KEY and VERLON_GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const verlon = new Verlon({ apiKey: process.env.VERLON_API_KEY });

const response = await verlon.video({
  gateId: process.env.VERLON_GATE_ID,
  data: {
    prompt: 'A cute robot walking through a futuristic city',
    size: '1280x720'
  }
});

console.log('Video with custom size generated successfully!');
console.log('Response:', response);
console.log('Size:', '1280x720');
console.log('Cost:', response.cost);
console.log('Model:', response.model);
