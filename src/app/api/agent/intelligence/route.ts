import { NextResponse } from 'next/server';
import { z } from 'zod';
import { executeMarketIntelligence } from '@/agent';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'fra1';

const RequestSchema = z.object({
  symbol: z.string().min(2, 'Symbol cannot be empty'),
  apiKey: z.string().optional(),
  providerOverride: z.enum(['groq', 'fireworks']).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parseResult = RequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request parameters',
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { symbol, apiKey, providerOverride } = parseResult.data;

    const result = await executeMarketIntelligence(symbol, {
      apiKey,
      providerOverride,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Market intelligence generation failed';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
