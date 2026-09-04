import { tool } from 'ai';
import { z } from 'zod';
import type { IBinanceAgentAdapter } from '@/lib/binance-mcp/types';
import { getBinanceAdapter } from '@/lib/binance-mcp';
import { AGENT_TOOL_DESCRIPTIONS } from './prompts';

/**
 * Strict trading pair symbol schema:
 * Disallows empty strings, validates length, and checks alphanumeric format.
 */
export const symbolSchema = z
  .string()
  .trim()
  .min(2, 'Trading symbol cannot be empty')
  .max(20, 'Trading symbol is too long')
  .regex(/^[A-Za-z0-9_]{2,20}$/, 'Trading symbol must be alphanumeric (e.g. BTCUSDT, SOLUSDC)');

/**
 * Builds AI SDK-compatible tools bound to the active Binance Agent OS adapter.
 * 
 * Supports both LiveBinanceMCPAdapter (remote MCP) and SimulatedBinanceAdapter
 * (live depth + in-memory Agentic sandbox).
 */
export function buildAgentTools(customAdapter?: IBinanceAgentAdapter) {
  const adapter = customAdapter ?? getBinanceAdapter();

  return {
    get_ticker_price: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getTickerPrice,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol in uppercase (e.g. SOLUSDT, BTCUSDT, ETHUSDT)'),
      }),
      execute: async ({ symbol }) => {
        try {
          const result = await adapter.getTickerPrice(symbol.toUpperCase());
          return {
            success: true,
            data: result,
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          return {
            success: false,
            error: message,
          };
        }
      },
    }),

    get_order_book: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getOrderBook,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol in uppercase (e.g. SOLUSDT, BTCUSDT)'),
        limit: z.coerce.number().int().min(1).max(100).default(20).describe('Depth levels to retrieve (default 20)'),
      }),
      execute: async ({ symbol, limit }) => {
        try {
          const result = await adapter.getOrderBook(symbol.toUpperCase(), limit);
          // Compute summary statistics for LLM context
          const bestBid = result.bids[0]?.[0] ?? 0;
          const bestAsk = result.asks[0]?.[0] ?? 0;
          const spread = bestAsk > 0 ? +(bestAsk - bestBid).toFixed(4) : 0;
          const spreadPercent = bestBid > 0 ? +((spread / bestBid) * 100).toFixed(4) : 0;

          const totalBidVolume = result.bids.reduce((sum, [, qty]) => sum + qty, 0);
          const totalAskVolume = result.asks.reduce((sum, [, qty]) => sum + qty, 0);
          const depthImbalanceRatio = totalAskVolume > 0 ? +(totalBidVolume / totalAskVolume).toFixed(2) : 1.0;

          return {
            success: true,
            summary: {
              symbol: result.symbol,
              bestBid,
              bestAsk,
              spread,
              spreadPercent,
              totalBidVolume: +totalBidVolume.toFixed(2),
              totalAskVolume: +totalAskVolume.toFixed(2),
              depthImbalanceRatio,
            },
            bids: result.bids.slice(0, 10),
            asks: result.asks.slice(0, 10),
            timestamp: result.timestamp,
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          return {
            success: false,
            error: message,
          };
        }
      },
    }),

    get_klines: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getKlines,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol in uppercase (e.g. SOLUSDT)'),
        interval: z
          .preprocess(
            (val) => (typeof val === 'string' ? val.toLowerCase() : val),
            z.enum(['1m', '5m', '15m', '1h', '4h', '1d'])
          )
          .default('15m')
          .describe('Candlestick timeframe interval'),
        limit: z.coerce.number().int().min(1).max(100).default(30).describe('Number of candlestick periods to fetch'),
      }),
      execute: async ({ symbol, interval, limit }) => {
        try {
          const klines = await adapter.getKlines(symbol.toUpperCase(), interval, limit);
          const recentCloses = klines.map((k) => k.close);
          const latestPrice = recentCloses[recentCloses.length - 1] ?? 0;
          const earliestPrice = recentCloses[0] ?? latestPrice;
          const periodChangePercent = earliestPrice > 0 ? +(((latestPrice - earliestPrice) / earliestPrice) * 100).toFixed(2) : 0;

          return {
            success: true,
            symbol: symbol.toUpperCase(),
            interval,
            periodChangePercent,
            latestPrice,
            candleCount: klines.length,
            klines: klines.slice(-15),
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          return {
            success: false,
            error: message,
          };
        }
      },
    }),

    get_24h_stats: tool({
      description: AGENT_TOOL_DESCRIPTIONS.get24hStats,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol in uppercase (e.g. SOLUSDT)'),
      }),
      execute: async ({ symbol }) => {
        try {
          const stats = await adapter.get24hStats(symbol.toUpperCase());
          return {
            success: true,
            data: stats,
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          return {
            success: false,
            error: message,
          };
        }
      },
    }),

    get_account_balance: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getAccountBalances,
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const balances = await adapter.getAccountBalances();
          return {
            success: true,
            balances,
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          return {
            success: false,
            error: message,
          };
        }
      },
    }),

    place_spot_order: tool({
      description: AGENT_TOOL_DESCRIPTIONS.placeSpotOrder,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol e.g. SOLUSDT'),
        side: z.enum(['BUY', 'SELL']).describe('Order direction'),
        quantity: z.number().positive().describe('Order size in base currency'),
        orderType: z.enum(['LIMIT', 'MARKET']).default('MARKET'),
        price: z.number().positive().optional().describe('Limit price (required for LIMIT orders)'),
      }),
      execute: async ({ symbol, side, quantity, orderType, price }) => {
        try {
          const result = await adapter.placeSpotOrder({
            symbol: symbol.toUpperCase(),
            side,
            type: orderType,
            quantity,
            price,
          });
          return {
            success: true,
            receipt: result,
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Execution rejected';
          return {
            success: false,
            error: message,
          };
        }
      },
    }),

    cancel_order: tool({
      description: AGENT_TOOL_DESCRIPTIONS.cancelOrder,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol e.g. SOLUSDT'),
        orderId: z.string().describe('Order ID to cancel'),
      }),
      execute: async ({ symbol, orderId }) => {
        try {
          const result = await adapter.cancelOrder(symbol.toUpperCase(), orderId);
          return {
            success: true,
            data: result,
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Cancel failed';
          return {
            success: false,
            error: message,
          };
        }
      },
    }),

    get_funding_rate: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getFundingRate,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair or perpetual contract symbol in uppercase (e.g. BTCUSDT, ETHUSDT, SOLUSDT)'),
      }),
      execute: async ({ symbol }) => {
        try {
          const result = await adapter.getFundingRate(symbol.toUpperCase());
          return {
            success: true,
            data: result,
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to retrieve funding rate';
          return {
            success: false,
            error: message,
          };
        }
      },
    }),

    get_average_price: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getAveragePrice,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol in uppercase (e.g. BTCUSDT, SOLUSDT)'),
      }),
      execute: async ({ symbol }) => {
        try {
          const result = await adapter.getAveragePrice(symbol.toUpperCase());
          return {
            success: true,
            data: result,
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to retrieve average price';
          return {
            success: false,
            error: message,
          };
        }
      },
    }),

    get_recent_trades: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getRecentTrades,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol in uppercase (e.g. BTCUSDT, SOLUSDT)'),
        limit: z.number().int().min(5).max(50).default(15).describe('Number of recent trades to fetch (default 15)'),
      }),
      execute: async ({ symbol, limit }) => {
        try {
          const trades = await adapter.getRecentTrades(symbol.toUpperCase(), limit);
          const totalVolume = trades.reduce((sum, t) => sum + t.qty, 0);
          const buyerMakerVolume = trades.filter((t) => t.isBuyerMaker).reduce((sum, t) => sum + t.qty, 0);
          const takerBuyVolume = +(totalVolume - buyerMakerVolume).toFixed(4);
          const takerSellVolume = +buyerMakerVolume.toFixed(4);

          return {
            success: true,
            symbol: symbol.toUpperCase(),
            summary: {
              tradeCount: trades.length,
              totalVolume: +totalVolume.toFixed(4),
              takerBuyVolume,
              takerSellVolume,
              buyRatio: totalVolume > 0 ? +((takerBuyVolume / totalVolume) * 100).toFixed(1) : 50,
            },
            trades: trades.slice(0, 10),
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to retrieve recent trades';
          return {
            success: false,
            error: message,
          };
        }
      },
    }),
  };
}
