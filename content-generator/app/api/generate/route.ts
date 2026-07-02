import { NextRequest, NextResponse } from 'next/server';
import { verlon } from '@/lib/verlon';

export async function POST(req: NextRequest) {
  let gateId: string | undefined;
  let prompt: string | undefined;

  try {
    const body = await req.json();
    gateId = body.gateId;
    prompt = body.prompt;

    if (!gateId || !prompt) {
      return NextResponse.json(
        { error: 'Gate ID and prompt are required' },
        { status: 400 }
      );
    }

    const result = await verlon.chat({
      gateId,
      data: {
        messages: [
          { role: 'user', content: prompt }
        ],
      },
    });

    return NextResponse.json({ content: result.content });
  } catch (error: any) {
    console.error('Generation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      gateId,
      prompt: prompt?.substring(0, 100),
    });
    return NextResponse.json(
      { error: error.message || 'Failed to generate content'},
      { status: 500 }
    );
  }
}