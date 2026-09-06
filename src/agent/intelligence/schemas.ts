import { z } from 'zod';
import type { InferenceProviderType } from '../providers/config';

/**
 * Strict Zod schema for Market Intelligence Agent 4-card executive payload.
 */
export const MarketIntelligencePayloadSchema = z.object({
  control: z.object({
    side: z.enum(['buyers', 'sellers', 'neutral']).describe('Dominant market flow participant'),
    imbalance: z.number().describe('Calculated bid/ask or ask/bid volume imbalance multiplier (e.g. 1.45)'),
    summary: z.string().describe('One concise sentence on order book depth support/resistance walls and flow control'),
  }),
  levels: z.object({
    support: z.number().describe('Calculated immediate support price level bounded by recent kline low/bids'),
    resistance: z.number().describe('Calculated immediate resistance price level bounded by recent kline high/asks'),
    bias: z.enum(['bullish', 'bearish', 'neutral']).describe('Technical structural pivot bias'),
    summary: z.string().describe('One concise sentence on price holding above/below pivot and next key obstacle'),
  }),
  positioning: z.object({
    fundingBias: z.enum(['longs_paying', 'shorts_paying', 'neutral']).describe('Perpetual funding rate status'),
    sentiment: z.enum(['bullish', 'mildly_bullish', 'neutral', 'mildly_bearish', 'bearish']).describe('Derivative sentiment'),
    summary: z.string().describe('One concise sentence on retail vs whale long/short positioning and funding heat'),
  }),
  playbook: z.object({
    target: z.number().describe('Tactical profit target price level'),
    invalidation: z.number().describe('Tactical stop loss or invalidation price level'),
    bias: z.enum(['dip_buyer', 'breakout', 'range_scalp', 'risk_off']).describe('Primary tactical trade archetype'),
    summary: z.string().describe('One concise sentence with actionable setup, risk/reward, and catalyst context'),
  }),
});

export type MarketIntelligencePayload = z.infer<typeof MarketIntelligencePayloadSchema>;

export interface MarketIntelligenceOptions {
  apiKey?: string;
  providerOverride?: InferenceProviderType;
}

export interface MarketIntelligenceResponse {
  symbol: string;
  timestamp: number;
  data: MarketIntelligencePayload;
  newsCount: number;
  sources: string[];
}
