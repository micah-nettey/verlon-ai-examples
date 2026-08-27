import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/verlon';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const gateId = process.env.VERLON_GATE_ID;
    if (!gateId) {
      return NextResponse.json(
        { error: 'VERLON_GATE_ID environment variable is required' },
        { status: 500 }
      );
    }

    const startTime = Date.now();

    const result = await openai.images.generate({
      model: gateId,
      prompt,
      n: 1,
    });

    const latency = Date.now() - startTime;

    const firstImage = result.data?.[0];
    const imageUrl = firstImage?.url || (firstImage?.b64_json ? `data:image/png;base64,${firstImage.b64_json}` : undefined);

    return NextResponse.json({
      content: imageUrl,
      latency,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to process image generation request' },
      { status: 500 }
    );
  }
}
