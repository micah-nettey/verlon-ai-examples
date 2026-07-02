import { config } from 'dotenv';
import { Verlon } from '@verlon-ai/sdk';

config({ override: true });

if (!process.env.VERLON_API_KEY || !process.env.VERLON_GATE_ID) {
  console.error('Error: VERLON_API_KEY and VERLON_GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const verlon = new Verlon({ apiKey: process.env.VERLON_API_KEY });

const response = await verlon.tts({
  gateId: process.env.VERLON_GATE_ID,
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
