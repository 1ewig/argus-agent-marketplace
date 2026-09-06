import { NextResponse } from 'next/server';
import {
  get24hStats,
  getFundingRate,
  getGlobalLongShortAccountRatio,
  getTopLongShortPositionRatio,
} from '@/lib/binance-mcp/public-api-client';
import { parseSymbolAssets } from '@/lib/symbols';
import type {
  GlobalMarketOverviewData,
  GlobalMarketOverviewResponse,
  MarketPulseAsset,
  MoverItem,
  FundingHeatmapItem,
} from '@/lib/types';

export const dynamic = 'force-dynamic';
export const preferredRegion = ['fra1', 'sin1', 'lhr1'];

const CORE_MAJORS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'] as const;
const UNIVERSE = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'ARBUSDT',
  'OPUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
] as const;

interface RawStatItem {
  symbol: string;
  baseAsset: string;
  price: number;
  changePercent: number;
}

export async function GET() {
  try {
    // 1. Parallel fetch 24h stats for all universe pairs
    const statsPromises = UNIVERSE.map(async (sym): Promise<RawStatItem | null> => {
      try {
        const stats = await get24hStats(sym);
        const { baseAsset } = parseSymbolAssets(sym);
        return {
          symbol: sym,
          baseAsset,
          price: stats.lastPrice,
          changePercent: stats.priceChangePercent,
        };
      } catch {
        return null;
      }
    });

    // 2. Parallel fetch funding rates for core majors
    const fundingPromises = CORE_MAJORS.map(async (sym): Promise<FundingHeatmapItem | null> => {
      try {
        const f = await getFundingRate(sym);
        const { baseAsset } = parseSymbolAssets(sym);
        const rate = f.lastFundingRate;
        const ratePercent = rate * 100;
        const apr = f.annualizedRatePercent;
        const bias: 'longs_paying' | 'shorts_paying' | 'neutral' =
          rate > 0.00002 ? 'longs_paying' : rate < -0.00002 ? 'shorts_paying' : 'neutral';

        return {
          symbol: sym,
          baseAsset,
          markPrice: f.markPrice,
          rate,
          ratePercent,
          apr,
          bias,
        };
      } catch {
        return null;
      }
    });

    // 3. Parallel fetch retail and whale long/short ratios for BTC and ETH
    const btcRetailPromise = getGlobalLongShortAccountRatio('BTCUSDT', '5m', 1).catch(() => null);
    const ethRetailPromise = getGlobalLongShortAccountRatio('ETHUSDT', '5m', 1).catch(() => null);
    const btcWhalePromise = getTopLongShortPositionRatio('BTCUSDT', '5m', 1).catch(() => null);
    const ethWhalePromise = getTopLongShortPositionRatio('ETHUSDT', '5m', 1).catch(() => null);

    // Await all parallel operations
    const [
      statsResults,
      fundingResults,
      btcRetail,
      ethRetail,
      btcWhale,
      ethWhale,
    ] = await Promise.all([
      Promise.all(statsPromises),
      Promise.all(fundingPromises),
      btcRetailPromise,
      ethRetailPromise,
      btcWhalePromise,
      ethWhalePromise,
    ]);

    const validStats: RawStatItem[] = statsResults.filter((s): s is RawStatItem => s !== null);
    const validFunding: FundingHeatmapItem[] = fundingResults.filter((f): f is FundingHeatmapItem => f !== null);

    // --- Market Pulse Assembly ---
    const statsMap = new Map<string, RawStatItem>(validStats.map((s) => [s.symbol, s]));

    const btcChange = statsMap.get('BTCUSDT')?.changePercent ?? 0;
    const ethChange = statsMap.get('ETHUSDT')?.changePercent ?? 0;
    const solChange = statsMap.get('SOLUSDT')?.changePercent ?? 0;
    const bnbChange = statsMap.get('BNBUSDT')?.changePercent ?? 0;

    const pulseAssets: MarketPulseAsset[] = CORE_MAJORS.map((sym) => {
      const match = statsMap.get(sym);
      const { baseAsset } = parseSymbolAssets(sym);
      return {
        symbol: sym,
        baseAsset,
        price: match?.price ?? 0,
        changePercent: match?.changePercent ?? 0,
      };
    });

    const avgChange = (btcChange + ethChange + solChange + bnbChange) / 4;
    const positiveCount = [btcChange, ethChange, solChange, bnbChange].filter((c) => c > 0).length;

    let bias: 'Risk-On' | 'Mildly Risk-On' | 'Neutral' | 'Mildly Risk-Off' | 'Risk-Off' = 'Neutral';
    if (positiveCount === 4) {
      bias = 'Risk-On';
    } else if (positiveCount === 3) {
      bias = 'Mildly Risk-On';
    } else if (positiveCount === 2) {
      bias = 'Neutral';
    } else if (positiveCount === 1) {
      bias = 'Mildly Risk-Off';
    } else {
      bias = 'Risk-Off';
    }

    // --- Top Movers Assembly ---
    const sortedStats = [...validStats].sort((a, b) => b.changePercent - a.changePercent);
    const gainers: MoverItem[] = sortedStats
      .filter((s) => s.changePercent > 0)
      .slice(0, 3)
      .map((s) => ({
        symbol: s.symbol,
        baseAsset: s.baseAsset,
        price: s.price,
        changePercent: s.changePercent,
      }));

    const losers: MoverItem[] = [...sortedStats]
      .reverse()
      .filter((s) => s.changePercent < 0)
      .slice(0, 3)
      .map((s) => ({
        symbol: s.symbol,
        baseAsset: s.baseAsset,
        price: s.price,
        changePercent: s.changePercent,
      }));

    // --- Funding Heatmap Assembly ---
    const fundingItems: FundingHeatmapItem[] = validFunding;

    // --- Positioning Assembly ---
    const btcRetailRatio = btcRetail?.[0]?.longShortRatio ?? 1.0;
    const ethRetailRatio = ethRetail?.[0]?.longShortRatio ?? 1.0;
    const btcWhaleRatio = btcWhale?.[0]?.longShortRatio ?? 1.0;
    const ethWhaleRatio = ethWhale?.[0]?.longShortRatio ?? 1.0;

    const retailRatio = (btcRetailRatio + ethRetailRatio) / 2;
    const whaleRatio = (btcWhaleRatio + ethWhaleRatio) / 2;

    const retailBias: 'Long-biased' | 'Short-biased' | 'Neutral' =
      retailRatio > 1.15 ? 'Long-biased' : retailRatio < 0.85 ? 'Short-biased' : 'Neutral';

    const whaleBias: 'Long-biased' | 'Short-biased' | 'Neutral' =
      whaleRatio > 1.15 ? 'Long-biased' : whaleRatio < 0.85 ? 'Short-biased' : 'Neutral';

    let summary = 'Retail and whale sentiment remain balanced across BTC and ETH.';
    if (retailBias === 'Long-biased' && whaleBias === 'Short-biased') {
      summary = 'Retail leaning aggressive long while top traders position short.';
    } else if (retailBias === 'Short-biased' && whaleBias === 'Long-biased') {
      summary = 'Top whale traders building long exposure against retail shorts.';
    } else if (retailBias === 'Long-biased' && whaleBias === 'Neutral') {
      summary = 'Retail leaning long while whales maintain neutral positioning.';
    } else if (retailBias === 'Long-biased' && whaleBias === 'Long-biased') {
      summary = 'Broad market alignment with both retail and whales positioned long.';
    } else if (retailBias === 'Short-biased' && whaleBias === 'Short-biased') {
      summary = 'Broad market caution with both retail and whales leaning short.';
    }

    const payload: GlobalMarketOverviewData = {
      timestamp: Date.now(),
      marketPulse: {
        btcChange,
        ethChange,
        solChange,
        bnbChange,
        assets: pulseAssets,
        bias,
        averageChange: avgChange,
      },
      topMovers: {
        gainers,
        losers,
      },
      funding: fundingItems,
      positioning: {
        retailRatio: parseFloat(retailRatio.toFixed(2)),
        whaleRatio: parseFloat(whaleRatio.toFixed(2)),
        retailBias,
        whaleBias,
        summary,
      },
    };

    const response: GlobalMarketOverviewResponse = {
      success: true,
      timestamp: Date.now(),
      data: payload,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
