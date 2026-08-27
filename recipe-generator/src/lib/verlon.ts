import OpenAI from 'openai';

if (!process.env.VERLON_API_KEY) {
  throw new Error('VERLON_API_KEY environment variable is required');
}

const baseUrl = process.env.VERLON_BASE_URL || 'https://api.verlon.ai';

export const openai = new OpenAI({
  apiKey: process.env.VERLON_API_KEY,
  baseURL: `${baseUrl}/v1`,
});
