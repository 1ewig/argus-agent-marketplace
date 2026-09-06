import { z } from 'zod';

/**
 * Idempotent Execution Receipt returned by Binance Executor
 */
export const ExecutionReceiptSchema = z.object({
  id: z.string(),
  binanceOrderId: z.string(),
  clientOrderId: z.string(),
  symbol: z.string(),
  side: z.enum(['BUY', 'SELL']),
  executedPrice: z.number(),
  executedQty: z.number(),
  totalCostUsd: z.number(),
  commissionUsd: z.number(),
  commissionAsset: z.string(),
  status: z.enum(['FILLED', 'PARTIALLY_FILLED', 'REJECTED']),
  timestamp: z.number(),
  executionMode: z.enum(['simulation']),
  riskCertificateId: z.string(),
});

export type ExecutionReceipt = z.infer<typeof ExecutionReceiptSchema>;
