import { z } from 'zod';

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
