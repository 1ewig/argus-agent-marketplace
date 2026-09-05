import type {
  BinanceRawTickerMessage,
  BinanceRawDepthMessage,
  LiveTickerData,
  LiveOrderBookData,
  OrderBookLevel,
} from './types';

/**
 * Public Binance Spot WebSocket Base URL
 */
export const BINANCE_WS_BASE_URL = 'wss://stream.binance.com:9443/stream';

/**
 * Constructs a combined stream URL subscribing to ticker (1000ms) and partial depth (100ms)
 * e.g. wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/btcusdt@depth10@100ms
 */
export function buildCombinedStreamUrl(symbol: string): string {
  const clean = symbol.trim().toLowerCase().replace(/[/\\_-]/g, '');
  return `${BINANCE_WS_BASE_URL}?streams=${clean}@ticker/${clean}@depth10@100ms`;
}

/**
 * Derives appropriate display decimal precision for crypto asset values
 */
export function getPrecisionForPrice(price: number): number {
  if (price <= 0) return 2;
  if (price < 0.0001) return 6;
  if (price < 1) return 4;
  return 2;
}

/**
 * Parses raw Binance 24hr ticker WebSocket message into clean UI model
 */
export function parseBinanceTickerMessage(
  raw: BinanceRawTickerMessage,
  prevPrice?: number
): LiveTickerData {
  const price = Number.parseFloat(raw.c) || 0;
  const high24h = Number.parseFloat(raw.h) || 0;
  const low24h = Number.parseFloat(raw.l) || 0;
  const changeAmount = Number.parseFloat(raw.p) || 0;
  const changePercent = Number.parseFloat(raw.P) || 0;
  const volumeBase = Number.parseFloat(raw.v) || 0;
  const volumeQuote = Number.parseFloat(raw.q) || 0;
  const precision = getPrecisionForPrice(price);

  let flashDirection: 'up' | 'down' | null = null;
  if (typeof prevPrice === 'number' && prevPrice > 0) {
    if (price > prevPrice) flashDirection = 'up';
    else if (price < prevPrice) flashDirection = 'down';
  }

  const rangeSpan = high24h - low24h || 1;
  const rangePositionPercent = Math.min(
    100,
    Math.max(0, Math.round(((price - low24h) / rangeSpan) * 100))
  );

  return {
    symbol: raw.s,
    price,
    changeAmount,
    changePercent,
    high24h,
    low24h,
    volumeBase,
    volumeQuote,
    precision,
    rangePositionPercent,
    flashDirection,
    lastUpdated: raw.E || Date.now(),
  };
}

/**
 * Parses raw Binance partial depth WebSocket message into clean UI model with cumulative depth
 */
export function parseBinanceDepthMessage(
  symbol: string,
  raw: BinanceRawDepthMessage,
  levelCount: number = 8
): LiveOrderBookData {
  const rawBids = Array.isArray(raw.bids) ? raw.bids.slice(0, levelCount) : [];
  const rawAsks = Array.isArray(raw.asks) ? raw.asks.slice(0, levelCount) : [];

  // Bids are delivered descending from best bid down.
  let cumBid = 0;
  const bidLevels: Array<{ price: number; qty: number; total: number }> = [];
  for (const [pStr, qStr] of rawBids) {
    const p = Number.parseFloat(pStr) || 0;
    const q = Number.parseFloat(qStr) || 0;
    cumBid += q;
    bidLevels.push({ price: p, qty: q, total: cumBid });
  }

  // Asks are delivered ascending from best ask up.
  let cumAsk = 0;
  const askLevels: Array<{ price: number; qty: number; total: number }> = [];
  for (const [pStr, qStr] of rawAsks) {
    const p = Number.parseFloat(pStr) || 0;
    const q = Number.parseFloat(qStr) || 0;
    cumAsk += q;
    askLevels.push({ price: p, qty: q, total: cumAsk });
  }

  const maxTotal = Math.max(cumBid, cumAsk, 0.0001);

  // In standard trading ladder, Asks are displayed top-to-bottom from highest ask down to best ask.
  const asksDescending = [...askLevels].reverse();

  const asks: OrderBookLevel[] = asksDescending.map((level) => ({
    ...level,
    depthPercent: Math.min(100, Math.round((level.total / maxTotal) * 100)),
  }));

  const bids: OrderBookLevel[] = bidLevels.map((level) => ({
    ...level,
    depthPercent: Math.min(100, Math.round((level.total / maxTotal) * 100)),
  }));

  const bestAsk = askLevels[0]?.price || 0;
  const bestBid = bidLevels[0]?.price || 0;
  const precision = getPrecisionForPrice(bestBid || bestAsk || 100);

  const spread = bestAsk > 0 && bestBid > 0 ? Number((bestAsk - bestBid).toFixed(precision)) : 0;
  const midPrice = (bestAsk + bestBid) / 2 || 1;
  const spreadPercent = Number(((spread / midPrice) * 100).toFixed(4));

  const totalDepth = cumBid + cumAsk || 1;
  const bidRatio = Math.round((cumBid / totalDepth) * 100);
  const askRatio = 100 - bidRatio;

  return {
    symbol,
    bids,
    asks,
    bestBid,
    bestAsk,
    spread,
    spreadPercent,
    bidRatio,
    askRatio,
    maxTotal,
    precision,
    lastUpdated: Date.now(),
  };
}
