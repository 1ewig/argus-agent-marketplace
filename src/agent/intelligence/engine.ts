import { generateObject } from 'ai';
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
import { getAgentModel, getBackupAgentModel } from '../providers/models';
import { DEFAULT_GROQ_MODEL, DEFAULT_GROQ_BACKUP_MODEL } from '../providers/config';
import {
  MarketIntelligencePayloadSchema,
  type MarketIntelligencePayload,
  type MarketIntelligenceOptions,
  type MarketIntelligenceResponse,
} from './schemas';
import {
  deriveQuantitativeAnchors,
  buildDeterministicIntelligencePayload,
} from './synthesizer';

export { MarketIntelligencePayloadSchema };
export type { MarketIntelligencePayload, MarketIntelligenceOptions, MarketIntelligenceResponse };

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
  const anchors = deriveQuantitativeAnchors(currentPrice, orderBook, klines15m, klines1h);
  const { bestBid, bestAsk, totalBidVol, totalAskVol, rawImbalance, min15mLow, max15mHigh, min1hLow, max1hHigh } = anchors;

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `   📡 [Data Ingestion] Spot: $${currentPrice} | Best Bid/Ask: $${bestBid}/$${bestAsk} | Depth Imbalance: ${rawImbalance}x`
    );
    console.log(
      `   📈 [Derivatives] Funding: ${funding ? `${(funding.lastFundingRate * 100).toFixed(4)}% (APR: ${funding.annualizedRatePercent}%)` : 'None'} | Catalysts: ${news?.results?.length ?? 0} articles`
    );
  }

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
- 15m Candlestick Count: ${klines15m.length} periods
- Futures Funding Rate: ${funding ? `${(funding.lastFundingRate * 100).toFixed(4)}% (APR: ${funding.annualizedRatePercent}%)` : 'No perpetual contract listed'}
- Global Retail Long/Short Ratio: ${latestGlobalLs ? `${latestGlobalLs.longShortRatio} (${(latestGlobalLs.longAccount * 100).toFixed(1)}% Longs)` : 'N/A'}
- Top Whale Trader Long/Short Ratio: ${latestTopLs ? `${latestTopLs.longShortRatio} (${(latestTopLs.longPosition * 100).toFixed(1)}% Longs)` : 'N/A'}
- Recent News Catalysts (Exa AI): ${newsSnippets.length > 0 ? JSON.stringify(newsSnippets) : 'No major breaking catalyst detected in past 24h'}

Synthesize the 4-card executive intelligence payload now.`;

  let primaryModel;
  let backupModel;
  try {
    // Hardcoded to Groq with DEFAULT_GROQ_MODEL (qwen/qwen3.8-27b) for rapid structured intelligence generation
    primaryModel = getAgentModel(DEFAULT_GROQ_MODEL, options.apiKey, 'groq');
    backupModel = getBackupAgentModel(DEFAULT_GROQ_BACKUP_MODEL, options.apiKey, 'groq');
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
        console.log(`   ✨ [Synthesis] Primary Groq LLM generated payload in ${Date.now() - startTime}ms`);
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
            console.log(`   ✨ [Synthesis] Backup Groq LLM generated payload in ${Date.now() - startTime}ms`);
          }
        } catch {
          // Fall through to deterministic synthesizer
        }
      }
    }
  }

  if (!finalPayload) {
    finalPayload = buildDeterministicIntelligencePayload(currentPrice, anchors, funding);
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
