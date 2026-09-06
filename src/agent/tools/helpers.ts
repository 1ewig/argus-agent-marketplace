import { z } from 'zod';
import { normalizeSymbol } from '@/lib/binance-mcp';

/**
 * Strict trading pair symbol schema:
 * Sanitizes separators/quotes, converts casing, and validates quote asset format.
 */
export const symbolSchema = z
  .string()
  .trim()
  .min(2, 'Trading symbol cannot be empty')
  .max(20, 'Trading symbol is too long')
  .superRefine((val, ctx) => {
    try {
      normalizeSymbol(val);
    } catch (err: unknown) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err instanceof Error ? err.message : 'Invalid trading symbol',
      });
    }
  })
  .transform((val) => normalizeSymbol(val));

/**
 * Standard tool execution wrapper that safely executes an async action
 * and guarantees a consistent { success: true, ... } | { success: false, error } envelope.
 */
export async function safeToolExecute<T>(
  action: () => Promise<T>,
  fallbackErrorMessage = 'Tool execution failed'
): Promise<{ success: true } & T | { success: false; error: string }> {
  try {
    const result = await action();
    return {
      success: true,
      ...(typeof result === 'object' && result !== null ? result : { data: result }),
    } as { success: true } & T;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : fallbackErrorMessage;
    return {
      success: false,
      error: message,
    };
  }
}
