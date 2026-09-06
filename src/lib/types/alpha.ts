import { z } from 'zod';

/**
 * Market Regime classification determined by Alpha Analyst
 */
export type MarketRegime =
  | 'trending_bull'
  | 'trending_bear'
  | 'range_bound'
  | 'high_volatility';

/**
 * Zod Schema: Proposed Trade formulated by Alpha Analyst
 */
export const ProposedTradeSchema = z.object({
  symbol: z.string().describe('Trading pair e.g. SOLUSDT or BTCUSDT'),
  side: z.enum(['BUY', 'SELL']),
  orderType: z.enum(['LIMIT', 'MARKET']),
  quantity: z.number().positive(),
  estimatedPrice: z.number().positive(),
  stopLossPrice: z.number().positive(),
  takeProfitPrice: z.number().positive(),
  riskRewardRatio: z.number().positive(),
  timeInForce: z.enum(['GTC', 'IOC', 'FOK']).default('GTC'),
  rationale: z.string(),
});

export type ProposedTrade = z.infer<typeof ProposedTradeSchema>;

/**
 * Zod Schema: Quantitative metrics evaluated from Binance MCP
 */
export const QuantitativeMetricsSchema = z.object({
  currentPrice: z.number().positive(),
  rsi14: z.number(),
  ema20: z.number(),
  ema50: z.number(),
  volume24hUsd: z.number(),
  depthImbalanceRatio: z.number().describe('>1 = bid heavy, <1 = ask heavy'),
});

export type QuantitativeMetrics = z.infer<typeof QuantitativeMetricsSchema>;

/**
 * Zod Schema: Qualitative catalyst discovered via web search
 */
export const QualitativeCatalystSchema = z.object({
  headline: z.string(),
  source: z.string(),
  sentiment: z.enum(['bullish', 'neutral', 'bearish']),
});

export type QualitativeCatalyst = z.infer<typeof QualitativeCatalystSchema>;

/**
 * Zod Schema: Complete Alpha Intelligence Report
 */
export const AlphaReportSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  timestamp: z.number(),
  regime: z.enum(['trending_bull', 'trending_bear', 'range_bound', 'high_volatility']),
  catalystSummary: z.string(),
  confidenceScore: z.number().min(0).max(100),
  proposedTrade: ProposedTradeSchema,
  quantitativeMetrics: QuantitativeMetricsSchema,
  qualitativeCatalyst: QualitativeCatalystSchema.optional(),
  invoiceId: z.string().optional(),
});

export type AlphaReport = z.infer<typeof AlphaReportSchema>;
