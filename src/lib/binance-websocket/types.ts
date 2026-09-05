/**
 * Binance Public WebSocket Stream Types & Normalized UI Models
 */

export type StreamConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

/**
 * Combined stream payload envelope from Binance WebSocket stream
 * e.g. wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/btcusdt@depth10@100ms
 */
export interface BinanceCombinedStreamMessage<T = unknown> {
  stream: string;
  data: T;
}

/**
 * Raw 24hr ticker stream message (<symbol>@ticker)
 */
export interface BinanceRawTickerMessage {
  e: string; // Event type ("24hrTicker")
  E: number; // Event time
  s: string; // Symbol ("BTCUSDT")
  p: string; // Price change
  P: string; // Price change percent
  w: string; // Weighted average price
  x: string; // First trade(F)-1 price (previous close)
  c: string; // Last price
  Q: string; // Last quantity
  b: string; // Best bid price
  B: string; // Best bid quantity
  a: string; // Best ask price
  A: string; // Best ask quantity
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
  O: number; // Statistics open time
  C: number; // Statistics close time
  F: number; // First trade ID
  L: number; // Last trade Id
  n: number; // Total number of trades
}

/**
 * Raw Partial Book Depth Streams (<symbol>@depth<levels>@100ms)
 * Levels: 5, 10, or 20
 */
export interface BinanceRawDepthMessage {
  lastUpdateId: number;
  bids: [string, string][]; // [price, qty]
  asks: [string, string][]; // [price, qty]
}

/**
 * Normalized Single Order Book Level
 */
export interface OrderBookLevel {
  price: number;
  qty: number;
  total: number;
  depthPercent: number;
}

/**
 * Normalized Order Book State for UI Presentation
 */
export interface LiveOrderBookData {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPercent: number;
  bidRatio: number;
  askRatio: number;
  maxTotal: number;
  precision: number;
  lastUpdated: number;
}

/**
 * Normalized Ticker State for UI Presentation
 */
export interface LiveTickerData {
  symbol: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volumeBase: number;
  volumeQuote: number;
  precision: number;
  rangePositionPercent: number;
  flashDirection: 'up' | 'down' | null;
  lastUpdated: number;
}

/**
 * Raw Mark Price stream message from Binance Futures
 * e.g. wss://fstream.binance.com/ws/<symbol>@markPrice@1s
 */
export interface BinanceRawMarkPriceMessage {
  e: string; // "markPriceUpdate"
  E: number; // Event time
  s: string; // Symbol
  p: string; // Mark price
  i: string; // Index price
  P: string; // Estimated Settle Price
  r: string; // Funding rate
  T: number; // Next funding time
}

/**
 * Normalized Futures & Funding Rate Sentinel Model
 */
export interface LiveFuturesFundingData {
  symbol: string;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
  fundingRatePercent: number;
  annualizedApr: number;
  nextFundingTime: number;
  basis: number;
  basisPercent: number;
  isAvailable: boolean;
  precision: number;
  lastUpdated: number;
}

/**
 * Micro Sparkline Data Point
 */
export interface SparklinePoint {
  time: number;
  price: number;
}
