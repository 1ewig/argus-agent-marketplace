import { z } from 'zod';

/**
 * Parameters for placing a spot order via Binance Agent OS
 */
export const PlaceSpotOrderParamsSchema = z.object({
  symbol: z.string().describe('Trading pair symbol e.g. SOLUSDT'),
  side: z.enum(['BUY', 'SELL']),
  type: z.enum(['LIMIT', 'MARKET', 'STOP_LOSS_LIMIT']).default('MARKET'),
  timeInForce: z.enum(['GTC', 'IOC', 'FOK']).optional(),
  quantity: z.number().positive().describe('Order quantity in base asset'),
  price: z.number().positive().optional().describe('Limit price (required for LIMIT orders)'),
  clientOrderId: z.string().optional().describe('Idempotency client identifier'),
  newClientOrderId: z.string().optional().describe('Idempotency client identifier (Binance alias)'),
});

export type PlaceSpotOrderParams = z.infer<typeof PlaceSpotOrderParamsSchema>;

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
 * Standard Account Balance in Agentic Wallet Sandbox
 */
export interface AccountBalance {
  asset: string;
  free: number;
  locked: number;
}

/**
 * Standard Order Execution Confirmation
 */
export interface OrderExecutionResult {
  orderId: string;
  clientOrderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  status: 'FILLED' | 'NEW' | 'PARTIALLY_FILLED' | 'CANCELED' | 'REJECTED';
  executedQty: number;
  cummulativeQuoteQty: number;
  price: number;
  commissionUsd: number;
  commissionAsset: string;
  timestamp: number;
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
 * Unified Binance Agent OS Adapter Interface
 * Implemented by both LiveBinanceMCPAdapter and SimulatedBinanceAdapter
 */
export interface IBinanceAgentAdapter {
  readonly mode: 'live_mcp' | 'simulation';

  /**
   * Retrieves the current ticker price for a given symbol
   */
  getTickerPrice(symbol: string): Promise<{ symbol: string; price: number }>;

  /**
   * Retrieves live order book depth (top bids and asks)
   */
  getOrderBook(symbol: string, limit?: number): Promise<NormalizedOrderBook>;

  /**
   * Retrieves candlestick history for technical indicators (RSI, EMAs)
   */
  getKlines(symbol: string, interval?: string, limit?: number): Promise<NormalizedKline[]>;

  /**
   * Retrieves 24-hour ticker price statistics and volume delta
   */
  get24hStats(symbol: string): Promise<{
    symbol: string;
    lastPrice: number;
    priceChangePercent: number;
    volumeQuote: number;
    highPrice: number;
    lowPrice: number;
  }>;

  /**
   * Retrieves perpetual futures funding rate, mark price, and next settlement time
   */
  getFundingRate(symbol: string): Promise<FundingRateData>;

  /**
   * Retrieves 5-minute rolling average price (VWAP benchmark)
   */
  getAveragePrice(symbol: string): Promise<AveragePriceData>;

  /**
   * Retrieves recent public market trade prints
   */
  getRecentTrades(symbol: string, limit?: number): Promise<RecentTradeData[]>;

  /**
   * Retrieves balances inside the isolated Agentic Wallet sandbox
   */
  getAccountBalances(): Promise<AccountBalance[]>;

  /**
   * Places an idempotent spot order into the Agentic Wallet sandbox
   */
  placeSpotOrder(params: PlaceSpotOrderParams): Promise<OrderExecutionResult>;

  /**
   * Cancels an active open order in the Agentic Wallet sandbox
   */
  cancelOrder(symbol: string, orderId: string): Promise<{ success: boolean; orderId: string }>;
}
