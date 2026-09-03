import { NextResponse } from 'next/server';
import { executeAgentStream, AgentChatRequestSchema } from '@/agent';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parseResult = AgentChatRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { message, symbol, mode, apiKey, history, isFirstTurn } = parseResult.data;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        try {
          await executeAgentStream(
            {
              prompt: message,
              symbol,
              mode,
              apiKey,
              history,
              isFirstTurn,
            },
            sendEvent
          );
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Internal agent execution error';
          sendEvent({ type: 'error', message: errMsg });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal agent execution error';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
