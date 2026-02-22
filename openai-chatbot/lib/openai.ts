import OpenAI from 'openai';

const apiKey = process.env.LAYER_API_KEY;
const gateId = process.env.GATE_ID;

console.log('[OpenAI Client Init]');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
console.log('Gate ID:', gateId || 'MISSING');

if (!apiKey) {
  throw new Error('LAYER_API_KEY environment variable is required');
}

if (!gateId) {
  throw new Error('GATE_ID environment variable is required');
}

const baseUrl = process.env.LAYER_API_URL || 'https://api.uselayer.ai';

export const openai = new OpenAI({
  baseURL: `${baseUrl}/v1`,
  apiKey: apiKey,
});

export const GATE_ID = gateId;
