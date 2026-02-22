import { config } from 'dotenv';
import { Layer } from '@layer-ai/sdk';

config({ path: '.env', override: true });

if (!process.env.LAYER_API_KEY || !process.env.GATE_ID) {
  console.error('Error: LAYER_API_KEY and GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const layer = new Layer({
  apiKey: process.env.LAYER_API_KEY
});

const response = await layer.chat({
  gateId: process.env.GATE_ID,
  data: {
    messages: [
      { role: 'user', content: 'Explain quantum computing in simple terms' }
    ]
  }
});

console.log(response.content);
