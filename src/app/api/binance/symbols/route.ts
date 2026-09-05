import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache on the server for 1 hour

export interface BinanceSymbolItem {
  symbol: string;
  baseAsset: string;
  quoteAsset: 'USDT';
}

interface BinanceExchangeInfoRaw {
  symbols: Array<{
    symbol: string;
    status: string;
    baseAsset: string;
    quoteAsset: string;
    isSpotTradingAllowed?: boolean;
  }>;
}

// Fallback high-liquidity symbols in case of network timeout
const FALLBACK_SYMBOLS: BinanceSymbolItem[] = [
  { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT' },
  { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT' },
  { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT' },
  { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT' },
  { symbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT' },
  { symbol: 'DOGEUSDT', baseAsset: 'DOGE', quoteAsset: 'USDT' },
  { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT' },
  { symbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT' },
  { symbol: 'SUIUSDT', baseAsset: 'SUI', quoteAsset: 'USDT' },
  { symbol: 'NEARUSDT', baseAsset: 'NEAR', quoteAsset: 'USDT' },
  { symbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT' },
  { symbol: 'PEPEUSDT', baseAsset: 'PEPE', quoteAsset: 'USDT' },
  { symbol: 'SHIBUSDT', baseAsset: 'SHIB', quoteAsset: 'USDT' },
];

// In-memory module-level cache for processed lightweight symbols list
let cachedSymbols: { data: BinanceSymbolItem[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET() {
  // 1. Serve from in-memory cache if fresh
  if (cachedSymbols && Date.now() - cachedSymbols.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      count: cachedSymbols.data.length,
      symbols: cachedSymbols.data,
      cached: true,
    });
  }

  try {
    // 2. Fetch raw exchangeInfo from Binance with cache: 'no-store'
    // This avoids Next.js's 2MB Data Cache limit (exchangeInfo is ~23.3MB)
    const res = await fetch('https://api.binance.com/api/v3/exchangeInfo?permissions=SPOT', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Binance API error: ${res.status}`);
    }

    const data = (await res.json()) as BinanceExchangeInfoRaw;

    const symbols: BinanceSymbolItem[] = data.symbols
      .filter(
        (s) =>
          s.status === 'TRADING' &&
          s.quoteAsset === 'USDT' &&
          (s.isSpotTradingAllowed === undefined || s.isSpotTradingAllowed === true)
      )
      .map((s) => ({
        symbol: s.symbol,
        baseAsset: s.baseAsset,
        quoteAsset: 'USDT' as const,
      }));

    // Prioritize popular pairs at the top, then sort the rest alphabetically
    const priority = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB'];
    symbols.sort((a, b) => {
      const pA = priority.indexOf(a.baseAsset);
      const pB = priority.indexOf(b.baseAsset);
      if (pA !== -1 && pB !== -1) return pA - pB;
      if (pA !== -1) return -1;
      if (pB !== -1) return 1;
      return a.baseAsset.localeCompare(b.baseAsset);
    });

    // 3. Cache processed lightweight symbols in memory
    cachedSymbols = {
      data: symbols,
      timestamp: Date.now(),
    };

    const headers = {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    };

    return NextResponse.json(
      {
        success: true,
        count: symbols.length,
        symbols,
      },
      { headers }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch symbols';
    // Graceful degradation: return cached or fallback symbols
    const fallbackList = cachedSymbols?.data ?? FALLBACK_SYMBOLS;
    return NextResponse.json(
      {
        success: true,
        count: fallbackList.length,
        symbols: fallbackList,
        warning: message,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  }
}
