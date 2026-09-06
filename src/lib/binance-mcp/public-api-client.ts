import type {
  NormalizedOrderBook,
  NormalizedKline,
  FundingRateData,
  AveragePriceData,
  RecentTradeData,
  OpenInterestData,
  GlobalLongShortAccountRatioData,
  TopLongShortPositionRatioData,
} from './types';

/**
 * Sanitizes and validates a Binance trading symbol:
 * - Strips outer quotes ("BTCUSDT" -> BTCUSDT, 'BTCUSDT' -> BTCUSDT)
 * - Strips internal separators (BTC/USDT -> BTCUSDT, BTC-USDT -> BTCUSDT)
 * - Converts to uppercase (btcusdt -> BTCUSDT)
 * - Enforces length and alphanumeric character format
 * - Verifies standard quote currency suffix
 */
export function normalizeSymbol(rawSymbol: string): string {
  if (!rawSymbol || typeof rawSymbol !== 'string') {
    throw new Error('Trading symbol cannot be empty');
  }

  // Strip outer quotes and spaces
  let clean = rawSymbol.trim().replace(/^["']+|["']+$/g, '').trim().toUpperCase();

  // Strip common pairing separators: / \ - _
  clean = clean.replace(/[/\\_-]/g, '');

  if (!clean || clean.length < 2 || clean.length > 20) {
    throw new Error('Trading symbol must be between 2 and 20 alphanumeric characters');
  }

  if (!/^[A-Z0-9]+$/.test(clean)) {
    throw new Error(`Invalid trading symbol format: "${rawSymbol}". Must be alphanumeric.`);
  }

  // Must end with a valid quote currency
  const validQuotes = ['USDT', 'USDC', 'FDUSD', 'EUR', 'TRY', 'BTC', 'ETH', 'BNB'];
  const hasValidQuote = validQuotes.some((q) => clean.endsWith(q) && clean.length > q.length);
  if (!hasValidQuote) {
    throw new Error(
      `Unrecognized trading pair format for "${rawSymbol}". Must end in a valid quote asset (e.g. USDT, USDC, BTC).`
    );
  }

  return clean;
}

export function formatAndValidateSymbol(rawSymbol: string): string {
  return normalizeSymbol(rawSymbol);
}

export interface FetchBinanceOptions {
  revalidateSeconds?: number;
  isFutures?: boolean;
}

/**
 * Official Spot API Cluster Pool for high availability, rate distribution, and failover
 */
export const BINANCE_SPOT_CLUSTER_ENDPOINTS = [
  'https://api.binance.com',
  'https://data-api.binance.vision',
  'https://api1.binance.com',
  'https://api2.binance.com',
  'https://api3.binance.com',
  'https://api-gcp.binance.com',
] as const;

/**
 * Official Futures API Cluster Pool
 */
export const BINANCE_FUTURES_CLUSTER_ENDPOINTS = [
  'https://fapi.binance.com',
] as const;

/**
 * Executes a Binance public REST request with automatic multi-cluster failover and unified error extraction.
 * Cycles through official cluster mirrors (api.binance.com, data-api.binance.vision, api1-3, api-gcp)
 * on network timeouts, 429 rate limits, or 5xx server errors.
 */
export async function fetchBinancePublic<T, R>(
  path: string,
  symbol: string,
  transform: (data: T) => R,
  options: FetchBinanceOptions = {}
): Promise<R> {
  const formatted = normalizeSymbol(symbol);
  const customSpotBase = process.env.BINANCE_SPOT_API_URL;
  const customFuturesBase = process.env.BINANCE_FUTURES_API_URL;

  const clusterPool: readonly string[] = options.isFutures
    ? customFuturesBase
      ? [customFuturesBase, ...BINANCE_FUTURES_CLUSTER_ENDPOINTS.filter((u) => u !== customFuturesBase)]
      : BINANCE_FUTURES_CLUSTER_ENDPOINTS
    : customSpotBase
    ? [customSpotBase, ...BINANCE_SPOT_CLUSTER_ENDPOINTS.filter((u) => u !== customSpotBase)]
    : BINANCE_SPOT_CLUSTER_ENDPOINTS;

  let lastError: Error | null = null;

  for (let i = 0; i < clusterPool.length; i++) {
    const baseUrl = clusterPool[i];
    const url = `${baseUrl}${path}`;

    try {
      const res = await fetch(url, {
        next: { revalidate: options.revalidateSeconds ?? 2 },
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) {
        // Deterministic validation error (invalid symbol) — do not retry other clusters
        if (res.status === 400) {
          const errData = (await res.json().catch(() => null)) as { msg?: string; code?: number } | null;
          throw new Error(
            errData?.msg ? `Binance API error: ${errData.msg} (${formatted})` : `Invalid symbol: ${formatted}`
          );
        }

        if (res.status === 451) {
          lastError = new Error(
            `Binance API geo-restricted (HTTP 451). Vercel Serverless Functions must run in a non-US region (e.g. fra1 Frankfurt).`
          );
          // 451 is domain/IP-specific, continue to attempt next cluster candidate (e.g. data-api.binance.vision)
          continue;
        }

        lastError = new Error(`Binance API error (${baseUrl}): ${res.status}`);
        continue;
      }

      const data = (await res.json()) as T;
      return transform(data);
    } catch (err: unknown) {
      // Deterministic validation errors should throw immediately without retrying clusters
      if (err instanceof Error && err.message.startsWith('Binance API error:') && err.message.includes('(')) {
        throw err;
      }
      if (err instanceof Error && err.message.startsWith('Invalid symbol:')) {
        throw err;
      }

      lastError = err instanceof Error ? err : new Error(String(err));
      // Continue to next cluster candidate
    }
  }

  throw lastError ?? new Error(`All Binance cluster endpoints failed for ${formatted}`);
}

/**
 * Fetches real-time spot price tick for a symbol.
 */
export async function getTickerPrice(symbol: string): Promise<{ symbol: string; price: number }> {
  const formatted = formatAndValidateSymbol(symbol);
  return fetchBinancePublic<{ symbol: string; price: string }, { symbol: string; price: number }>(
    `/api/v3/ticker/price?symbol=${formatted}`,
    formatted,
    (data) => ({ symbol: data.symbol, price: parseFloat(data.price) }),
    { revalidateSeconds: 2 }
  );
}

const VALID_DEPTH_TIERS = [5, 10, 20, 50, 100, 500, 1000, 5000] as const;

function getNearestBinanceDepthLimit(requested: number): number {
  for (const tier of VALID_DEPTH_TIERS) {
    if (requested <= tier) return tier;
  }
  return 5000;
}

/**
 * Fetches live order book depth (bids & asks).
 */
export async function getOrderBook(symbol: string, limit: number = 20): Promise<NormalizedOrderBook> {
  const formatted = formatAndValidateSymbol(symbol);
  const safeLimit = Math.min(Math.max(limit, 1), 5000);
  const binanceLimit = getNearestBinanceDepthLimit(safeLimit);
  return fetchBinancePublic<
    { lastUpdateId: number; bids: [string, string][]; asks: [string, string][] },
    NormalizedOrderBook
  >(
    `/api/v3/depth?symbol=${formatted}&limit=${binanceLimit}`,
    formatted,
    (data) => ({
      symbol: formatted,
      lastUpdateId: data.lastUpdateId,
      bids: data.bids.slice(0, safeLimit).map((b) => [parseFloat(b[0]), parseFloat(b[1])]),
      asks: data.asks.slice(0, safeLimit).map((a) => [parseFloat(a[0]), parseFloat(a[1])]),
      timestamp: Date.now(),
    }),
    { revalidateSeconds: 2 }
  );
}

/**
 * Fetches historical candlestick (OHLCV) intervals.
 */
export async function getKlines(symbol: string, interval: string = '15m', limit: number = 30): Promise<NormalizedKline[]> {
  const formatted = formatAndValidateSymbol(symbol);
  const safeLimit = Math.min(Math.max(limit, 1), 1000);
  return fetchBinancePublic<(string | number)[][], NormalizedKline[]>(
    `/api/v3/klines?symbol=${formatted}&interval=${interval}&limit=${safeLimit}`,
    formatted,
    (data) =>
      data.map((k) => ({
        openTime: Number(k[0]),
        open: parseFloat(String(k[1])),
        high: parseFloat(String(k[2])),
        low: parseFloat(String(k[3])),
        close: parseFloat(String(k[4])),
        volume: parseFloat(String(k[5])),
        closeTime: Number(k[6]),
      })),
    { revalidateSeconds: 10 }
  );
}

/**
 * Fetches rolling 24-hour volume and price statistics.
 */
export async function get24hStats(symbol: string) {
  const formatted = formatAndValidateSymbol(symbol);
  return fetchBinancePublic<
    {
      symbol: string;
      lastPrice: string;
      priceChangePercent: string;
      quoteVolume: string;
      highPrice: string;
      lowPrice: string;
    },
    {
      symbol: string;
      lastPrice: number;
      priceChangePercent: number;
      volumeQuote: number;
      highPrice: number;
      lowPrice: number;
    }
  >(
    `/api/v3/ticker/24hr?symbol=${formatted}`,
    formatted,
    (data) => ({
      symbol: data.symbol,
      lastPrice: parseFloat(data.lastPrice),
      priceChangePercent: parseFloat(data.priceChangePercent),
      volumeQuote: parseFloat(data.quoteVolume),
      highPrice: parseFloat(data.highPrice),
      lowPrice: parseFloat(data.lowPrice),
    }),
    { revalidateSeconds: 5 }
  );
}

/**
 * Fetches perpetual futures funding rate, mark price, and settlement countdown.
 */
export async function getFundingRate(symbol: string): Promise<FundingRateData> {
  const formatted = formatAndValidateSymbol(symbol);
  return fetchBinancePublic<
    {
      symbol: string;
      markPrice: string;
      indexPrice: string;
      lastFundingRate: string;
      nextFundingTime: number;
      interestRate?: string;
    },
    FundingRateData
  >(
    `/fapi/v1/premiumIndex?symbol=${formatted}`,
    formatted,
    (data) => {
      const lastFundingRate = parseFloat(data.lastFundingRate);
      return {
        symbol: data.symbol,
        markPrice: parseFloat(data.markPrice),
        indexPrice: parseFloat(data.indexPrice),
        lastFundingRate,
        annualizedRatePercent: +(lastFundingRate * 3 * 365 * 100).toFixed(2),
        nextFundingTime: Number(data.nextFundingTime),
        interestRate: parseFloat(data.interestRate ?? '0.0001'),
      };
    },
    { revalidateSeconds: 15, isFutures: true }
  );
}

/**
 * Fetches 5-minute rolling average price (VWAP benchmark).
 */
export async function getAveragePrice(symbol: string): Promise<AveragePriceData> {
  const formatted = formatAndValidateSymbol(symbol);
  return fetchBinancePublic<{ symbol: string; price: string; mins?: number }, AveragePriceData>(
    `/api/v3/avgPrice?symbol=${formatted}`,
    formatted,
    (data) => ({
      symbol: formatted,
      price: parseFloat(data.price),
      mins: Number(data.mins ?? 5),
    }),
    { revalidateSeconds: 5 }
  );
}

/**
 * Fetches recent public market trades.
 */
export async function getRecentTrades(symbol: string, limit: number = 15): Promise<RecentTradeData[]> {
  const formatted = formatAndValidateSymbol(symbol);
  const safeLimit = Math.min(Math.max(limit, 1), 1000);
  return fetchBinancePublic<Array<Record<string, unknown>>, RecentTradeData[]>(
    `/api/v3/trades?symbol=${formatted}&limit=${safeLimit}`,
    formatted,
    (data) =>
      data.map((t) => ({
        id: Number(t.id),
        price: parseFloat(String(t.price)),
        qty: parseFloat(String(t.qty)),
        quoteQty: parseFloat(String(t.quoteQty)),
        time: Number(t.time),
        isBuyerMaker: Boolean(t.isBuyerMaker),
      })),
    { revalidateSeconds: 2 }
  );
}

/**
 * Fetches perpetual futures open interest.
 */
export async function getOpenInterest(symbol: string): Promise<OpenInterestData> {
  const formatted = formatAndValidateSymbol(symbol);
  return fetchBinancePublic<
    {
      symbol: string;
      openInterest: string;
      time: number;
    },
    OpenInterestData
  >(
    `/fapi/v1/openInterest?symbol=${formatted}`,
    formatted,
    (data) => ({
      symbol: data.symbol,
      openInterest: parseFloat(data.openInterest),
      time: Number(data.time),
    }),
    { revalidateSeconds: 15, isFutures: true }
  );
}

export const VALID_RATIO_PERIODS = ['5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d'] as const;
export type RatioPeriod = typeof VALID_RATIO_PERIODS[number];

/**
 * Fetches global long vs. short account ratio (general market sentiment).
 */
export async function getGlobalLongShortAccountRatio(
  symbol: string,
  period: string = '5m',
  limit: number = 30
): Promise<GlobalLongShortAccountRatioData[]> {
  const formatted = formatAndValidateSymbol(symbol);
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const safePeriod = VALID_RATIO_PERIODS.includes(period as RatioPeriod) ? period : '5m';

  return fetchBinancePublic<
    Array<{
      symbol: string;
      longAccount?: string;
      shortAccount?: string;
      longShortRatio?: string;
      timestamp?: number;
    }>,
    GlobalLongShortAccountRatioData[]
  >(
    `/futures/data/globalLongShortAccountRatio?symbol=${formatted}&period=${safePeriod}&limit=${safeLimit}`,
    formatted,
    (data) =>
      data.map((d) => {
        const rawLong = d.longAccount ?? '0.5';
        const rawShort = d.shortAccount ?? '0.5';
        const rawRatio = d.longShortRatio ?? '1.0';
        const parsedLong = parseFloat(rawLong);
        const parsedShort = parseFloat(rawShort);
        const parsedRatio = parseFloat(rawRatio);
        return {
          symbol: d.symbol,
          longAccount: Number.isFinite(parsedLong) ? parsedLong : 0.5,
          shortAccount: Number.isFinite(parsedShort) ? parsedShort : 0.5,
          longShortRatio: Number.isFinite(parsedRatio) ? parsedRatio : 1.0,
          timestamp: Number(d.timestamp || Date.now()),
        };
      }),
    { revalidateSeconds: 15, isFutures: true }
  );
}

/**
 * Fetches top 20% whale trader long vs. short position ratio.
 */
export async function getTopLongShortPositionRatio(
  symbol: string,
  period: string = '5m',
  limit: number = 30
): Promise<TopLongShortPositionRatioData[]> {
  const formatted = formatAndValidateSymbol(symbol);
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const safePeriod = VALID_RATIO_PERIODS.includes(period as RatioPeriod) ? period : '5m';

  return fetchBinancePublic<
    Array<{
      symbol: string;
      longAccount?: string;
      longPosition?: string;
      shortAccount?: string;
      shortPosition?: string;
      longShortRatio?: string;
      timestamp?: number;
    }>,
    TopLongShortPositionRatioData[]
  >(
    `/futures/data/topLongShortPositionRatio?symbol=${formatted}&period=${safePeriod}&limit=${safeLimit}`,
    formatted,
    (data) =>
      data.map((d) => {
        const rawLong = d.longPosition ?? d.longAccount ?? '0.5';
        const rawShort = d.shortPosition ?? d.shortAccount ?? '0.5';
        const rawRatio = d.longShortRatio ?? '1.0';
        const parsedLong = parseFloat(rawLong);
        const parsedShort = parseFloat(rawShort);
        const parsedRatio = parseFloat(rawRatio);
        return {
          symbol: d.symbol,
          longPosition: Number.isFinite(parsedLong) ? parsedLong : 0.5,
          shortPosition: Number.isFinite(parsedShort) ? parsedShort : 0.5,
          longShortRatio: Number.isFinite(parsedRatio) ? parsedRatio : 1.0,
          timestamp: Number(d.timestamp || Date.now()),
        };
      }),
    { revalidateSeconds: 15, isFutures: true }
  );
}


