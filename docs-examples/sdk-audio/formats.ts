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
    input: 'This audio will be generated in MP3 format.',
    responseFormat: 'mp3',
    speed: 1.0
  }
});

console.log('Audio generated with format and speed options!');
console.log('Response:', response);
console.log('Format: mp3');
console.log('Speed: 1.0');
console.log('Cost:', response.cost);
console.log('Model:', response.model);
if (response.audio.duration) {
  console.log('Duration:', response.audio.duration, 'seconds');
}
