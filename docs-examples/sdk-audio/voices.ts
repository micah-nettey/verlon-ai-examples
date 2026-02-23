import { config } from 'dotenv';
import { Layer } from '@layer-ai/sdk';

config({ override: true });

if (!process.env.LAYER_API_KEY || !process.env.GATE_ID) {
  console.error('Error: LAYER_API_KEY and GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const layer = new Layer({ apiKey: process.env.LAYER_API_KEY });

const response = await layer.tts({
  gateId: process.env.GATE_ID,
  data: {
    input: 'The weather today is sunny and warm, perfect for a walk in the park.',
    voice: 'alloy'
  }
});

console.log('Audio generated with voice selection!');
console.log('Response:', response);
console.log('Voice used: alloy');
console.log('Cost:', response.cost);
console.log('Model:', response.model);
if (response.audio.duration) {
  console.log('Duration:', response.audio.duration, 'seconds');
}
