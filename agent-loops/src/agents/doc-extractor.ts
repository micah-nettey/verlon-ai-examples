/**
 * Doc-extractor agent — single-call structured-output extraction.
 *
 * One call site:
 *   1. EXTRACTOR — reads an unstructured passage and returns a strict
 *      JSON object describing the company / contact / dates / amounts
 *      it contains. Uses OpenAI's response_format=json_schema for hard
 *      schema enforcement.
 *
 * Different shape from research / customer-support: no orchestrator,
 * no tool loop, no specialists. Just one structured-output call. This
 * is the simplest possible Verlon adoption — a single gate that wraps
 * one model call.
 *
 * Run direct:
 *   pnpm extract "passage to extract from..."
 *
 * Run via Verlon:
 *   USE_VERLON=true pnpm extract "..."
 */
import { randomUUID } from 'node:crypto';
import { buildOpenAIClient, verlonHeaders } from '../lib/openai-client.js';

const EXTRACTOR_MODEL = 'gpt-4o-mini';
const MAX_TOKENS = 1024;

const EXTRACTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    company: {
      type: ['string', 'null'],
      description: 'The company name mentioned, if any.',
    },
    contact: {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: { type: ['string', 'null'] },
        email: { type: ['string', 'null'] },
        phone: { type: ['string', 'null'] },
      },
      required: ['name', 'email', 'phone'],
    },
    dates: {
      type: 'array',
      items: { type: 'string' },
      description: 'Any dates mentioned, in ISO format when possible.',
    },
    amounts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          value: { type: 'number' },
          currency: { type: 'string' },
        },
        required: ['value', 'currency'],
      },
    },
    summary: {
      type: 'string',
      description: 'One-sentence summary of the passage.',
    },
  },
  required: ['company', 'contact', 'dates', 'amounts', 'summary'],
} as const;

interface Extraction {
  company: string | null;
  contact: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  dates: string[];
  amounts: { value: number; currency: string }[];
  summary: string;
}

export async function extractOne(passage: string): Promise<{
  sessionId: string;
  extraction: Extraction;
}> {
  const client = buildOpenAIClient();
  const sessionId = randomUUID();
  const useVerlon = process.env.USE_VERLON === 'true';
  console.log(
    `\n=== extractor session ${sessionId.slice(0, 8)} ${useVerlon ? '(via Verlon)' : '(direct OpenAI)'} ===`
  );

  const res = await client.chat.completions.create(
    {
      model: EXTRACTOR_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'system',
          content:
            'You extract structured data from unstructured text. Return strict JSON matching the provided schema. Use null for any field not mentioned in the passage. Do not invent data.',
        },
        { role: 'user', content: passage },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'extraction',
          schema: EXTRACTION_SCHEMA,
          strict: true,
        },
      },
    },
    {
      headers: verlonHeaders({
        gateIdEnvVar: 'EXTRACTOR_GATE_ID',
        sessionId,
      }),
    }
  );

  const raw = res.choices[0]?.message?.content;
  if (!raw) throw new Error('Extractor returned no content');
  const extraction = JSON.parse(raw) as Extraction;
  console.log(JSON.stringify(extraction, null, 2));
  return { sessionId, extraction };
}

// ----------------------------------------------------------------------
// CLI — only fire when this is the entry module, so simulators that
// import { extractOne } don't trigger the argv parse + process.exit.
// ----------------------------------------------------------------------

const isEntry = import.meta.url === `file://${process.argv[1]}`;
if (isEntry) {
  const passage = process.argv.slice(2).join(' ').trim();
  if (!passage) {
    console.error('Usage: pnpm extract "passage to extract from"');
    process.exit(1);
  }
  extractOne(passage).catch((err) => {
    console.error('Crashed:', err);
    process.exit(1);
  });
}
