import { generateObject } from 'ai';
import { z } from 'zod';
import {
  normalizeSymbol,
  getTickerPrice,
  getOrderBook,
  getKlines,
  getAveragePrice,
  getFundingRate,
  getGlobalLongShortAccountRatio,
  getTopLongShortPositionRatio,
} from '@/lib/binance-mcp';
import { searchExa } from '@/lib/exa';
import { getAgentModel, getBackupAgentModel, type InferenceProviderType } from './providers';

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

/**
 * Executes live market data fetching across Binance Spot/Futures REST and Exa AI Neural Search,
 * then generates a grounded, structured 4-card executive intelligence payload.
 */
export async function executeMarketIntelligence(
  rawSymbol: string,
  options: MarketIntelligenceOptions = {}
): Promise<MarketIntelligenceResponse> {
  const startTime = Date.now();
  const cleanSymbol = normalizeSymbol(rawSymbol);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📊 [Argus:MarketIntelligence] Scan initiated | Symbol: #${cleanSymbol}`);
  }

  // Extract base asset for news search (e.g. SOL from SOLUSDT)
  const baseAsset = cleanSymbol.replace(/(USDT|USDC|FDUSD|BTC|ETH|BNB|EUR|TRY)$/, '') || cleanSymbol;

  // 1. Parallel live data fetching across all exchange endpoints + Exa web search
  const [
    tickerRes,
    orderBookRes,
    klines15mRes,
    klines1hRes,
    avgPriceRes,
    fundingRes,
    globalLsRes,
    topLsRes,
    newsRes,
  ] = await Promise.allSettled([
    getTickerPrice(cleanSymbol),
    getOrderBook(cleanSymbol, 20),
    getKlines(cleanSymbol, '15m', 30),
    getKlines(cleanSymbol, '1h', 24),
    getAveragePrice(cleanSymbol),
    getFundingRate(cleanSymbol),
    getGlobalLongShortAccountRatio(cleanSymbol, '5m', 5),
    getTopLongShortPositionRatio(cleanSymbol, '5m', 5),
    searchExa({
      query: `${baseAsset} crypto token catalyst news`,
      category: 'news',
      numResults: 3,
      includeText: true,
      maxTextCharacters: 400,
    }),
  ]);

  // Extract authentic results
  const ticker = tickerRes.status === 'fulfilled' ? tickerRes.value : null;
  const currentPrice = ticker?.price ?? 0;

  const orderBook = orderBookRes.status === 'fulfilled' ? orderBookRes.value : null;
  const klines15m = klines15mRes.status === 'fulfilled' ? klines15mRes.value : [];
  const klines1h = klines1hRes.status === 'fulfilled' ? klines1hRes.value : [];
  const avgPrice = avgPriceRes.status === 'fulfilled' ? avgPriceRes.value : null;
  const funding = fundingRes.status === 'fulfilled' ? fundingRes.value : null;
  const globalLs = globalLsRes.status === 'fulfilled' ? globalLsRes.value : [];
  const topLs = topLsRes.status === 'fulfilled' ? topLsRes.value : [];
  const news = newsRes.status === 'fulfilled' ? newsRes.value : null;

  // Derive quantitative anchors
  const bestBid = orderBook?.bids[0]?.[0] ?? currentPrice;
  const bestAsk = orderBook?.asks[0]?.[0] ?? currentPrice;
  const totalBidVol = orderBook?.bids.reduce((sum, [, q]) => sum + q, 0) ?? 0;
  const totalAskVol = orderBook?.asks.reduce((sum, [, q]) => sum + q, 0) ?? 0;
  const rawImbalance = totalAskVol > 0 ? +(totalBidVol / totalAskVol).toFixed(2) : 1.0;

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `   📡 [Data Ingestion] Spot: $${currentPrice} | Best Bid/Ask: $${bestBid}/$${bestAsk} | Depth Imbalance: ${rawImbalance}x`
    );
    console.log(
      `   📈 [Derivatives] Funding: ${funding ? `${(funding.lastFundingRate * 100).toFixed(4)}% (APR: ${funding.annualizedRatePercent}%)` : 'None'} | Catalysts: ${news?.results?.length ?? 0} articles`
    );
  }

  const kline15mCloses = klines15m.map((k) => k.close);
  const kline15mHighs = klines15m.map((k) => k.high);
  const kline15mLows = klines15m.map((k) => k.low);

  const min15mLow = kline15mLows.length > 0 ? Math.min(...kline15mLows) : currentPrice * 0.98;
  const max15mHigh = kline15mHighs.length > 0 ? Math.max(...kline15mHighs) : currentPrice * 1.02;

  const kline1hHighs = klines1h.map((k) => k.high);
  const kline1hLows = klines1h.map((k) => k.low);
  const min1hLow = kline1hLows.length > 0 ? Math.min(...kline1hLows) : min15mLow;
  const max1hHigh = kline1hHighs.length > 0 ? Math.max(...kline1hHighs) : max15mHigh;

  const latestGlobalLs = globalLs[globalLs.length - 1];
  const latestTopLs = topLs[topLs.length - 1];

  const newsSnippets = (news?.results ?? []).map((n) => ({
    title: n.title,
    snippet: n.highlights?.[0] || n.text?.slice(0, 150) || '',
    url: n.url,
  }));

  // Construct structured analysis prompt with 100% live exchange facts
  const systemPrompt = `You are the Argus Market Intelligence Engine. Your role is to analyze real-time live Binance exchange metrics and Exa AI search findings for #${cleanSymbol} and synthesize a structured, grounded executive intelligence payload across 4 cards:
1. CONTROL: Evaluate order book bid/ask pressure, imbalance ratio, and who is defending the range.
2. KEY LEVELS: Calculate exact, mathematically bounded support and resistance levels from recent klines/pivots, and determine directional bias.
3. POSITIONING: Interpret perpetual futures funding rate, annualized APR, and retail vs whale long/short ratios.
4. TACTICAL PLAYBOOK: Formulate an actionable trade bias (dip_buyer, breakout, range_scalp, or risk_off) with a precise target and invalidation price level (risk/reward strictly >= 1.8), factoring in live news catalysts.

STRICT RULES:
- Never hallucinate prices. Support must be strictly < current price ($${currentPrice}), resistance strictly > current price ($${currentPrice}).
- Format numbers cleanly with realistic market precision.
- Keep summaries punchy, professional, and dense with actionable insight (maximum 1 sentence each).`;

  const userPrompt = `Live Market Telemetry for #${cleanSymbol}:
- Current Spot Price: $${currentPrice}
- 5m Rolling VWAP: $${avgPrice?.price ?? currentPrice}
- Order Book Top Bids/Asks: Best Bid $${bestBid}, Best Ask $${bestAsk}
- 20-Level Depth Volume: Total Bids ${totalBidVol.toFixed(2)}, Total Asks ${totalAskVol.toFixed(2)}, Imbalance Ratio: ${rawImbalance}x
- 15m Range Low: $${min15mLow}, 15m Range High: $${max15mHigh}
- 1h Higher-Timeframe Low: $${min1hLow}, 1h High: $${max1hHigh}
- 15m Candlestick Count: ${kline15mCloses.length} periods
- Futures Funding Rate: ${funding ? `${(funding.lastFundingRate * 100).toFixed(4)}% (APR: ${funding.annualizedRatePercent}%)` : 'No perpetual contract listed'}
- Global Retail Long/Short Ratio: ${latestGlobalLs ? `${latestGlobalLs.longShortRatio} (${(latestGlobalLs.longAccount * 100).toFixed(1)}% Longs)` : 'N/A'}
- Top Whale Trader Long/Short Ratio: ${latestTopLs ? `${latestTopLs.longShortRatio} (${(latestTopLs.longPosition * 100).toFixed(1)}% Longs)` : 'N/A'}
- Recent News Catalysts (Exa AI): ${newsSnippets.length > 0 ? JSON.stringify(newsSnippets) : 'No major breaking catalyst detected in past 24h'}

Synthesize the 4-card executive intelligence payload now.`;

  let primaryModel;
  let backupModel;
  try {
    primaryModel = getAgentModel(undefined, options.apiKey, options.providerOverride);
    backupModel = getBackupAgentModel(undefined, options.apiKey, options.providerOverride);
  } catch {
    // If models cannot be initialized, use deterministic computation
  }

  let finalPayload: MarketIntelligencePayload | null = null;

  if (primaryModel) {
    try {
      const result = await generateObject({
        model: primaryModel,
        schema: MarketIntelligencePayloadSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });

      finalPayload = result.object;
      if (process.env.NODE_ENV !== 'production') {
        console.log(`   ✨ [Synthesis] Primary LLM generated payload in ${Date.now() - startTime}ms`);
      }
    } catch {
      if (backupModel) {
        try {
          const result = await generateObject({
            model: backupModel,
            schema: MarketIntelligencePayloadSchema,
            system: systemPrompt,
            prompt: userPrompt,
          });

          finalPayload = result.object;
          if (process.env.NODE_ENV !== 'production') {
            console.log(`   ✨ [Synthesis] Backup LLM generated payload in ${Date.now() - startTime}ms`);
          }
        } catch {
          // Fall through to deterministic synthesizer
        }
      }
    }
  }

  if (!finalPayload) {
    // Deterministic Fallback grounded in exact Binance mathematical metrics
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

    finalPayload = {
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

    if (process.env.NODE_ENV !== 'production') {
      console.log(`   ⚡ [Synthesis] Computed deterministic mathematical payload in ${Date.now() - startTime}ms`);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`🏁 [Argus:MarketIntelligence] Completed 4-card payload for #${cleanSymbol}:`);
    console.log(`      • Control: ${finalPayload.control.side} (${finalPayload.control.imbalance}x imbalance)`);
    console.log(`      • Key Levels: Support $${finalPayload.levels.support} | Resistance $${finalPayload.levels.resistance} (${finalPayload.levels.bias})`);
    console.log(`      • Positioning: ${finalPayload.positioning.fundingBias} | Sentiment: ${finalPayload.positioning.sentiment}`);
    console.log(`      • Tactical Playbook: ${finalPayload.playbook.bias} -> Target $${finalPayload.playbook.target} | Invalidation $${finalPayload.playbook.invalidation}`);
  }

  return {
    symbol: cleanSymbol,
    timestamp: Date.now(),
    data: finalPayload,
    newsCount: newsSnippets.length,
    sources: newsSnippets.map((n) => n.url).filter(Boolean),
  };
}
