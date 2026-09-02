import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runAnalystAgent } from '@/lib/agents/analyst-agent';

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  symbol: z.string().default('SOLUSDT'),
  mode: z.enum(['simulation', 'live_mcp']).default('simulation'),
  apiKey: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parseResult = ChatRequestSchema.safeParse(json);

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

    const { message, symbol, mode, apiKey } = parseResult.data;

    const result = await runAnalystAgent({
      prompt: message,
      symbol,
      mode,
      apiKey,
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
