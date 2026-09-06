import type { MarketIntelligencePayload } from './schemas';
import type { getOrderBook, getKlines, getFundingRate } from '@/lib/binance-mcp';

type OrderBookResult = Awaited<ReturnType<typeof getOrderBook>>;
type KlinesResult = Awaited<ReturnType<typeof getKlines>>;
type FundingRateResult = Awaited<ReturnType<typeof getFundingRate>>;

export interface QuantitativeAnchors {
  bestBid: number;
  bestAsk: number;
  totalBidVol: number;
  totalAskVol: number;
  rawImbalance: number;
  min15mLow: number;
  max15mHigh: number;
  min1hLow: number;
  max1hHigh: number;
}

/**
 * Deterministically derives quantitative market anchors from live Binance order book and kline data.
 */
export function deriveQuantitativeAnchors(
  currentPrice: number,
  orderBook: OrderBookResult | null,
  klines15m: KlinesResult,
  klines1h: KlinesResult
): QuantitativeAnchors {
  const bestBid = orderBook?.bids[0]?.[0] ?? currentPrice;
  const bestAsk = orderBook?.asks[0]?.[0] ?? currentPrice;
  const totalBidVol = orderBook?.bids.reduce((sum, [, q]) => sum + q, 0) ?? 0;
  const totalAskVol = orderBook?.asks.reduce((sum, [, q]) => sum + q, 0) ?? 0;
  const rawImbalance = totalAskVol > 0 ? +(totalBidVol / totalAskVol).toFixed(2) : 1.0;

  const kline15mHighs = klines15m.map((k) => k.high);
  const kline15mLows = klines15m.map((k) => k.low);
  const min15mLow = kline15mLows.length > 0 ? Math.min(...kline15mLows) : currentPrice * 0.98;
  const max15mHigh = kline15mHighs.length > 0 ? Math.max(...kline15mHighs) : currentPrice * 1.02;

  const kline1hHighs = klines1h.map((k) => k.high);
  const kline1hLows = klines1h.map((k) => k.low);
  const min1hLow = kline1hLows.length > 0 ? Math.min(...kline1hLows) : min15mLow;
  const max1hHigh = kline1hHighs.length > 0 ? Math.max(...kline1hHighs) : max15mHigh;

  return {
    bestBid,
    bestAsk,
    totalBidVol,
    totalAskVol,
    rawImbalance,
    min15mLow,
    max15mHigh,
    min1hLow,
    max1hHigh,
  };
}

/**
 * Builds a deterministic mathematical 4-card payload strictly grounded in exchange math when LLMs are offline or fail.
 */
export function buildDeterministicIntelligencePayload(
  currentPrice: number,
  anchors: QuantitativeAnchors,
  funding: FundingRateResult | null
): MarketIntelligencePayload {
  const { rawImbalance, min15mLow, max15mHigh } = anchors;

  const isBuyerDominant = rawImbalance >= 1.05;
  const isSellerDominant = rawImbalance <= 0.95;
  const controlSide = isBuyerDominant ? 'buyers' : isSellerDominant ? 'sellers' : 'neutral';

  const calculatedSupport = +(min15mLow > 0 ? min15mLow : currentPrice * 0.985).toFixed(currentPrice < 1 ? 4 : 2);
  const calculatedResistance = +(max15mHigh > 0 ? max15mHigh : currentPrice * 1.015).toFixed(currentPrice < 1 ? 4 : 2);

  const isFundingPositive = funding ? funding.lastFundingRate > 0.0001 : false;
  const isFundingNegative = funding ? funding.lastFundingRate < -0.0001 : false;
  const fundingBias = isFundingPositive ? 'longs_paying' : isFundingNegative ? 'shorts_paying' : 'neutral';

  const targetPrice = +(calculatedResistance * 1.002).toFixed(currentPrice < 1 ? 4 : 2);
  const invalidationPrice = +(calculatedSupport * 0.995).toFixed(currentPrice < 1 ? 4 : 2);

  return {
    control: {
      side: controlSide,
      imbalance: rawImbalance,
      summary: isBuyerDominant
        ? `Buyers in control with ${rawImbalance}x bid support across top 20 depth levels.`
        : isSellerDominant
        ? `Sellers pressing down with ${+(1 / rawImbalance).toFixed(2)}x ask resistance.`
        : 'Balanced liquidity distribution with neutral order book pressure.',
    },
    levels: {
      support: calculatedSupport,
      resistance: calculatedResistance,
      bias: isBuyerDominant ? 'bullish' : isSellerDominant ? 'bearish' : 'neutral',
      summary: `Holding above immediate $${calculatedSupport.toLocaleString()} support; next test at $${calculatedResistance.toLocaleString()}.`,
    },
    positioning: {
      fundingBias,
      sentiment: isFundingPositive ? 'mildly_bullish' : isFundingNegative ? 'mildly_bearish' : 'neutral',
      summary: funding
        ? `Perpetual funding rate at ${(funding.lastFundingRate * 100).toFixed(4)}% (${funding.annualizedRatePercent}% APR).`
        : 'Perpetual contract not listed; relying on spot volume profile.',
    },
    playbook: {
      target: targetPrice,
      invalidation: invalidationPrice,
      bias: isBuyerDominant ? 'dip_buyer' : 'range_scalp',
      summary: `Favorable risk/reward positioning toward $${targetPrice.toLocaleString()} target with invalidation at $${invalidationPrice.toLocaleString()}.`,
    },
  };
}
