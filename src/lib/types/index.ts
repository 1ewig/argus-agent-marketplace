import { z } from 'zod';

/**
 * Autonomous Argus Agent Roles
 */
export type AgentRole = 'orchestrator' | 'analyst' | 'risk_arbiter' | 'executor';

/**
 * Execution Mode for Binance operations
 */
export type ExecutionMode = 'simulation' | 'live_mcp';

/**
 * Argus Operation Mode: Copilot (human approves) vs Autonomous (pure M2M loop)
 */
export type GuardianMode = 'copilot' | 'autonomous';
export type SyndicateMode = GuardianMode; // Backwards-compatible alias

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

/**
 * Institutional Risk Policy enforced by Risk Arbiter ("The Iron Gate")
 */
export interface RiskPolicy {
  maxSlippagePercent: number; // e.g. 0.25%
  maxPositionPercentOfWallet: number; // e.g. 20%
  minRiskRewardRatio: number; // e.g. 1.5
  maxDailyDrawdownPercent: number; // e.g. 5.0%
  minLiquidationBufferPercent: number; // e.g. 25%
  mandatoryStopLoss: boolean;
}

/**
 * Evaluated Risk Metrics computed strictly via deterministic math
 */
export const EvaluatedRiskMetricsSchema = z.object({
  slippageEstimatedPercent: z.number(),
  orderBookDepthCheckedLevels: z.number(),
  positionSizeUsd: z.number(),
  accountBalanceUsd: z.number(),
  positionPercent: z.number(),
  riskRewardRatio: z.number(),
  dailyDrawdownPercent: z.number(),
});

export type EvaluatedRiskMetrics = z.infer<typeof EvaluatedRiskMetricsSchema>;

/**
 * Cryptographic Risk Certificate issued by Risk Arbiter
 */
export const RiskCertificateSchema = z.object({
  id: z.string(),
  status: z.enum(['APPROVED', 'REJECTED']),
  proposalDigest: z.string(),
  timestamp: z.number(),
  expiresAt: z.number(),
  evaluatedMetrics: EvaluatedRiskMetricsSchema,
  policyViolations: z.array(z.string()),
  signature: z.string(),
});

export type RiskCertificate = z.infer<typeof RiskCertificateSchema>;

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
  executionMode: z.enum(['simulation', 'live_mcp']),
  riskCertificateId: z.string(),
});

export type ExecutionReceipt = z.infer<typeof ExecutionReceiptSchema>;

/**
 * x402 Micropayment Invoice
 */
export const X402InvoiceSchema = z.object({
  protocol: z.literal('x402'),
  version: z.literal('1.0'),
  invoiceId: z.string(),
  amount: z.string(),
  currency: z.literal('USDC'),
  recipientAddress: z.string(),
  memo: z.string(),
  expiresAt: z.number(),
});

export type X402Invoice = z.infer<typeof X402InvoiceSchema>;

/**
 * x402 Micropayment Proof Receipt
 */
export const X402PaymentReceiptSchema = z.object({
  protocol: z.literal('x402'),
  txHash: z.string(),
  invoiceId: z.string(),
  amount: z.string(),
  currency: z.literal('USDC'),
  senderAddress: z.string(),
  recipientAddress: z.string(),
  timestamp: z.number(),
  status: z.literal('CONFIRMED'),
});

export type X402PaymentReceipt = z.infer<typeof X402PaymentReceiptSchema>;

/**
 * Visual Multi-Agent Communication Stream Message
 */
export interface AgentMessage {
  id: string;
  role: AgentRole;
  title: string;
  content: string;
  timestamp: number;
  status: 'idle' | 'working' | 'success' | 'warning' | 'error';
  metadata?: Record<string, unknown>;
  x402Receipt?: X402PaymentReceipt;
  alphaReport?: AlphaReport;
  riskCertificate?: RiskCertificate;
  executionReceipt?: ExecutionReceipt;
}
