import { Verlon } from '@verlon-ai/sdk';

if (!process.env.VERLON_API_KEY) {
  throw new Error('VERLON_API_KEY environment variable is required');
}

export const verlon = new Verlon({
  apiKey: process.env.VERLON_API_KEY,
  baseUrl: process.env.VERLON_BASE_URL,
});
