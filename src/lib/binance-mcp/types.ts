/**
 * Normalized Single Order Book Level: [price, quantity]
 */
export type OrderBookLevel = [number, number];

/**
 * Normalized Order Book Depth representation
 */
export interface NormalizedOrderBook {
  symbol: string;
  lastUpdateId?: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

/**
 * Normalized Candlestick (Kline) data point
 */
export interface NormalizedKline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

/**
 * Funding Rate & Mark Price for Perpetual Futures
 */
export interface FundingRateData {
  symbol: string;
  markPrice: number;
  indexPrice: number;
  lastFundingRate: number;
  annualizedRatePercent: number;
  nextFundingTime: number;
  interestRate: number;
}

/**
 * Rolling Average Price (VWAP)
 */
export interface AveragePriceData {
  symbol: string;
  price: number;
  mins: number;
}

/**
 * Public Market Trade execution print
 */
export interface RecentTradeData {
  id: number;
  price: number;
  qty: number;
  quoteQty: number;
  time: number;
  isBuyerMaker: boolean;
}

/**
 * Perpetual Futures Open Interest
 */
export interface OpenInterestData {
  symbol: string;
  openInterest: number;
  time: number;
}

/**
 * Global Long/Short Account Ratio Data Point (Retail/General crowd sentiment)
 */
export interface GlobalLongShortAccountRatioData {
  symbol: string;
  longAccount: number;
  shortAccount: number;
  longShortRatio: number;
  timestamp: number;
}

/**
 * Top Trader Long/Short Position Ratio Data Point (Top 20% whale positioning)
 */
export interface TopLongShortPositionRatioData {
  symbol: string;
  longPosition: number;
  shortPosition: number;
  longShortRatio: number;
  timestamp: number;
}
