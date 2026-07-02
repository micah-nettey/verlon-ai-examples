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

// Streaming example from documentation
const stream = verlon.chatStream({
  gateId: process.env.VERLON_GATE_ID,
  data: {
    messages: [
      { role: 'user', content: 'Write a poem about the ocean' }
    ]
  }
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content || '');
}
console.log('\n');
