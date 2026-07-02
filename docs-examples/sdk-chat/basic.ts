import { config } from 'dotenv';
import { Verlon } from '@verlon-ai/sdk';

config({ path: '.env', override: true });

if (!process.env.VERLON_API_KEY || !process.env.VERLON_GATE_ID) {
  console.error('Error: VERLON_API_KEY and VERLON_GATE_ID environment variables are required');
  console.error('Copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const verlon = new Verlon({
  apiKey: process.env.VERLON_API_KEY
});

// Basic chat example from documentation
const response = await verlon.chat({
  gateId: process.env.VERLON_GATE_ID,
  data: {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Explain quantum computing in simple terms' }
    ]
  }
});

console.log(response.content);
console.log('Cost:', response.cost);
console.log('Model:', response.model);
