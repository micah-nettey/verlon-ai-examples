import { config } from 'dotenv';
import { Layer } from '@layer-ai/sdk';

config({ path: '.env', override: true });

if (!process.env.LAYER_API_KEY || !process.env.GATE_ID) {
  console.error('Error: LAYER_API_KEY and GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const layer = new Layer({ apiKey: process.env.LAYER_API_KEY });

const response = await layer.image({
  gateId: process.env.GATE_ID,
  data: {
    prompt: 'A colorful abstract painting with geometric shapes'
  }
});

console.log('Generated', response.images?.length || 1, 'images');
console.log('Response:', response);
console.log('Total cost:', response.cost);
console.log('Model:', response.model);
