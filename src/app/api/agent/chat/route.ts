import { NextResponse } from 'next/server';
import { executeAgent, AgentChatRequestSchema } from '@/agent';

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

    const { message, symbol, mode, apiKey, history } = parseResult.data;

    const result = await executeAgent({
      prompt: message,
      symbol,
      mode,
      apiKey,
      history,
    });

    return NextResponse.json({
      success: true,
      data: result,
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
