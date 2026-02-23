import { config } from 'dotenv';
import { Layer } from '@layer-ai/sdk';

config({ path: '.env', override: true });

if (!process.env.LAYER_API_KEY || !process.env.GATE_ID) {
  console.error('Error: LAYER_API_KEY and GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const layer = new Layer({ apiKey: process.env.LAYER_API_KEY });

const response = await layer.video({
  gateId: process.env.GATE_ID,
  data: {
    prompt: 'A serene mountain landscape transitioning from dawn to dusk'
  }
});

console.log('Video generated successfully!');
console.log('Response:', response);
console.log('Cost:', response.cost);
console.log('Model:', response.model);
