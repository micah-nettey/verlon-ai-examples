import { openai, GATE_ID } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const startTime = Date.now();

    // @ts-ignore - gateId is a Verlon AI extension to OpenAI API
    // Note: We don't specify a model here - Verlon AI uses the model configured in the gate
    // This demonstrates that you can use ANY model (GPT, Claude, Gemini, Mistral) just by changing the gate config
    const stream = await openai.chat.completions.create({
      messages,
      max_tokens: 500,
      gateId: GATE_ID,
      stream: true,
    });

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();
    let fullContent = '';
    let model = '';
    let cost = 0;

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullContent += content;

            // Track model and cost from chunks
            if (chunk.model) {
              model = chunk.model;
            }
            if ((chunk as any).usage) {
              const usage = (chunk as any).usage;
              // Cost will be in the final chunk
            }

            // Send the content chunk to the client
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }

          const latency = Date.now() - startTime;

          // Send metadata as the final chunk (prefixed with special marker)
          const metadata = JSON.stringify({
            __metadata: true,
            model,
            cost,
            latency,
          });
          controller.enqueue(encoder.encode(`\n__METADATA__${metadata}`));

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get response' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
