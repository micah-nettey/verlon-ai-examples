import { config } from 'dotenv';
import { Verlon } from '@verlon-ai/sdk';

config({ path: '.env', override: true });

if (!process.env.VERLON_API_KEY || !process.env.VERLON_GATE_ID) {
  console.error('Error: VERLON_API_KEY and VERLON_GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const verlon = new Verlon({ apiKey: process.env.VERLON_API_KEY });

const response = await verlon.image({
  gateId: process.env.VERLON_GATE_ID,
  data: {
    prompt: 'A cute robot reading a book',
    size: '1024x1024',
    quality: 'hd'
  }
});

console.log('HD Image generated successfully!');
console.log('Response:', response);
console.log('Size:', '1024x1024');
console.log('Quality:', 'hd');
console.log('Cost:', response.cost);
console.log('Model:', response.model);
