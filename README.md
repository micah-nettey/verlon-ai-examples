# Verlon AI examples (deprecated)

These examples are out of date and no longer maintained. Some use APIs Verlon no longer offers, and their code won't run as written. New examples will replace them.

To call Verlon today, use the official OpenAI SDK pointed at Verlon, with your gate's id as the model:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.verlon.ai/v1',
  apiKey: process.env.VERLON_API_KEY,
});

const reply = await openai.chat.completions.create({
  model: process.env.VERLON_GATE_ID, // your gate's id
  messages: [{ role: 'user', content: 'Hello' }],
});
```

The Anthropic, Gemini and Mistral SDKs work the same way.

- [OpenAI SDK guide](https://docs.verlon.ai/integrations/openai-sdk)
- [Agent tracing with OpenTelemetry](https://docs.verlon.ai/platform/agent-gates)
- [All documentation](https://docs.verlon.ai)
