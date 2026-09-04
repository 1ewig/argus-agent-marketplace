import type {
  IBinanceAgentAdapter,
  NormalizedOrderBook,
  NormalizedKline,
  AccountBalance,
  PlaceSpotOrderParams,
  OrderExecutionResult,
  FundingRateData,
  AveragePriceData,
  RecentTradeData,
  OpenInterestData,
} from './types';
import { fetchBinancePublic, formatAndValidateSymbol } from './public-api-client';
import { SimulatedAgentWallet } from './simulated-wallet';

/**
 * High-Fidelity Simulation Adapter for Binance Agent OS.
 * 
 * Fetches real, live market depth, tickers, and klines directly from Binance public data feeds
 * while executing trades inside an isolated, local simulated Agentic Wallet sandbox.
 */
export class SimulatedBinanceAdapter implements IBinanceAgentAdapter {
  public readonly mode = 'simulation' as const;
  private wallet = new SimulatedAgentWallet();

  /**
   * Fetches current price using Binance public API.
   */
  public async getTickerPrice(symbol: string): Promise<{ symbol: string; price: number }> {
    const formatted = formatAndValidateSymbol(symbol);
    return fetchBinancePublic<{ symbol: string; price: string }, { symbol: string; price: number }>(
      `/api/v3/ticker/price?symbol=${formatted}`,
      formatted,
      (data) => ({ symbol: data.symbol, price: parseFloat(data.price) }),
      { revalidateSeconds: 2 }
    );
  }

  /**
   * Fetches live order book depth (bids & asks) for accurate slippage modeling.
   */
  public async getOrderBook(symbol: string, limit: number = 20): Promise<NormalizedOrderBook> {
    const formatted = formatAndValidateSymbol(symbol);
    return fetchBinancePublic<
      { lastUpdateId: number; bids: [string, string][]; asks: [string, string][] },
      NormalizedOrderBook
    >(
      `/api/v3/depth?symbol=${formatted}&limit=${limit}`,
      formatted,
      (data) => ({
        symbol: formatted,
        lastUpdateId: data.lastUpdateId,
        bids: data.bids.map((b) => [parseFloat(b[0]), parseFloat(b[1])]),
        asks: data.asks.map((a) => [parseFloat(a[0]), parseFloat(a[1])]),
        timestamp: Date.now(),
      }),
      { revalidateSeconds: 2 }
    );
  }

  /**
   * Fetches historical candlestick (OHLCV) intervals for pattern recognition.
   */
  public async getKlines(symbol: string, interval: string = '15m', limit: number = 50): Promise<NormalizedKline[]> {
    const formatted = formatAndValidateSymbol(symbol);
    return fetchBinancePublic<(string | number)[][], NormalizedKline[]>(
      `/api/v3/klines?symbol=${formatted}&interval=${interval}&limit=${limit}`,
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
   * Fetches 24-hour volume and price statistics.
   */
  public async get24hStats(symbol: string) {
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
   * Fetches perpetual futures funding rate and mark price.
   */
  public async getFundingRate(symbol: string): Promise<FundingRateData> {
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
  public async getAveragePrice(symbol: string): Promise<AveragePriceData> {
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
  public async getRecentTrades(symbol: string, limit: number = 15): Promise<RecentTradeData[]> {
    const formatted = formatAndValidateSymbol(symbol);
    const safeLimit = Math.min(Math.max(limit, 5), 50);
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
  public async getOpenInterest(symbol: string): Promise<OpenInterestData> {
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

  /**
   * Retrieves balances inside the isolated Agentic Wallet sandbox.
   */
  public async getAccountBalances(): Promise<AccountBalance[]> {
    return this.wallet.getBalances();
  }

  /**
   * Simulates order execution against live market price and updates sandbox balances.
   */
  public async placeSpotOrder(params: PlaceSpotOrderParams): Promise<OrderExecutionResult> {
    const ticker = await this.getTickerPrice(params.symbol);
    return this.wallet.executeOrder(params, ticker.price);
  }

  /**
   * Simulates order cancellation.
   */
  public async cancelOrder(symbol: string, orderId: string): Promise<{ success: boolean; orderId: string }> {
    return this.wallet.cancelOrder(symbol, orderId);
  }
}
