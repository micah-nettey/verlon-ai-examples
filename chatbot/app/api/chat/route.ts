import { NextRequest, NextResponse } from 'next/server';
import { verlon } from '@/lib/verlon';

export async function POST(req: NextRequest) {
  let messages: any[] | undefined;

  try {
    const body = await req.json();
    messages = body.messages;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
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

    const result = await verlon.chat({
      gateId,
      data: {
        messages,
      },
    });

    const latency = Date.now() - startTime;

    return NextResponse.json({
      content: result.content,
      model: result.model,
      cost: result.cost,
      latency,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      messagesCount: messages?.length,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
