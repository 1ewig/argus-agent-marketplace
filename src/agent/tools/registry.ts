import { tool } from 'ai';
import { z } from 'zod';
import {
  normalizeSymbol,
  getTickerPrice,
  getOrderBook,
  getKlines,
  get24hStats,
  getFundingRate,
  getAveragePrice,
  getRecentTrades,
  getOpenInterest,
  getGlobalLongShortAccountRatio,
  getTopLongShortPositionRatio,
} from '@/lib/binance-mcp';
import { searchExa, ExaSearchInputSchema } from '@/lib/exa';
import { AGENT_TOOL_DESCRIPTIONS } from '../prompts/descriptions';
import { symbolSchema, safeToolExecute } from './helpers';

export { symbolSchema };

/**
 * Builds AI SDK-compatible tools calling live Binance public endpoints directly.
 */
export function buildAgentTools() {
  return {
    get_ticker_price: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getTickerPrice,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol in uppercase (e.g. SOLUSDT, BTCUSDT, ETHUSDT)'),
      }),
      execute: async ({ symbol }) =>
        safeToolExecute(async () => {
          const result = await getTickerPrice(symbol.toUpperCase());
          return { data: result };
        }, 'Failed to retrieve ticker price'),
    }),

    get_order_book: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getOrderBook,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol in uppercase (e.g. SOLUSDT, BTCUSDT)'),
        limit: z
          .coerce
          .number({ message: 'Depth limit must be a number' })
          .int('Depth limit must be an integer')
          .min(1, 'Depth limit must be at least 1')
          .max(100, 'Depth limit cannot exceed 100')
          .default(20)
          .describe('Depth levels to retrieve (1-100, default 20)'),
      }),
      execute: async ({ symbol, limit }) =>
        safeToolExecute(async () => {
          const result = await getOrderBook(symbol.toUpperCase(), limit);
          const bestBid = result.bids[0]?.[0] ?? 0;
          const bestAsk = result.asks[0]?.[0] ?? 0;
          const spread = bestAsk > 0 ? +(bestAsk - bestBid).toFixed(4) : 0;
          const spreadPercent = bestBid > 0 ? +((spread / bestBid) * 100).toFixed(4) : 0;

          const totalBidVolume = result.bids.reduce((sum, [, qty]) => sum + qty, 0);
          const totalAskVolume = result.asks.reduce((sum, [, qty]) => sum + qty, 0);
          const depthImbalanceRatio = totalAskVolume > 0 ? +(totalBidVolume / totalAskVolume).toFixed(2) : 1.0;

          return {
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
            bids: result.bids,
            asks: result.asks,
            timestamp: result.timestamp,
          };
        }, 'Failed to retrieve order book depth'),
    }),

    get_klines: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getKlines,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol in uppercase (e.g. SOLUSDT)'),
        interval: z
          .preprocess(
            (val) => (typeof val === 'string' ? val.trim() : val),
            z.enum(
              ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
              { message: 'Invalid interval timeframe. Valid options: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M' }
            )
          )
          .default('15m')
          .describe('Candlestick timeframe interval (e.g. 1m, 5m, 15m, 1h, 4h, 1d)'),
        limit: z
          .coerce
          .number({ message: 'Candles limit must be a number' })
          .int('Candles limit must be an integer')
          .min(1, 'Candles limit must be at least 1')
          .max(100, 'Candles limit cannot exceed 100')
          .default(30)
          .describe('Number of candlestick periods to fetch (1-100, default 30)'),
      }),
      execute: async ({ symbol, interval, limit }) =>
        safeToolExecute(async () => {
          const klines = await getKlines(symbol.toUpperCase(), interval, limit);
          const recentCloses = klines.map((k) => k.close);
          const latestPrice = recentCloses[recentCloses.length - 1] ?? 0;
          const earliestPrice = recentCloses[0] ?? latestPrice;
          const periodChangePercent = earliestPrice > 0 ? +(((latestPrice - earliestPrice) / earliestPrice) * 100).toFixed(2) : 0;

          return {
            symbol: symbol.toUpperCase(),
            interval,
            periodChangePercent,
            latestPrice,
            candleCount: klines.length,
            klines,
          };
        }, 'Failed to retrieve candlestick data'),
    }),

    get_24h_stats: tool({
      description: AGENT_TOOL_DESCRIPTIONS.get24hStats,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol in uppercase (e.g. SOLUSDT)'),
      }),
      execute: async ({ symbol }) =>
        safeToolExecute(async () => {
          const stats = await get24hStats(symbol.toUpperCase());
          return { data: stats };
        }, 'Failed to retrieve 24h stats'),
    }),

    get_funding_rate: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getFundingRate,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair or perpetual contract symbol in uppercase (e.g. BTCUSDT, ETHUSDT, SOLUSDT)'),
      }),
      execute: async ({ symbol }) =>
        safeToolExecute(async () => {
          const result = await getFundingRate(symbol.toUpperCase());
          return { data: result };
        }, 'Failed to retrieve funding rate'),
    }),

    get_average_price: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getAveragePrice,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol in uppercase (e.g. BTCUSDT, SOLUSDT)'),
      }),
      execute: async ({ symbol }) =>
        safeToolExecute(async () => {
          const result = await getAveragePrice(symbol.toUpperCase());
          return { data: result };
        }, 'Failed to retrieve average price'),
    }),

    get_recent_trades: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getRecentTrades,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair symbol in uppercase (e.g. BTCUSDT, SOLUSDT)'),
        limit: z
          .coerce
          .number({ message: 'Trades limit must be a number' })
          .int('Trades limit must be an integer')
          .min(1, 'Trades limit must be at least 1')
          .max(100, 'Trades limit cannot exceed 100')
          .default(15)
          .describe('Number of recent trades to fetch (1-100, default 15)'),
      }),
      execute: async ({ symbol, limit }) =>
        safeToolExecute(async () => {
          const trades = await getRecentTrades(symbol.toUpperCase(), limit);
          const totalVolume = trades.reduce((sum, t) => sum + t.qty, 0);
          const buyerMakerVolume = trades.filter((t) => t.isBuyerMaker).reduce((sum, t) => sum + t.qty, 0);
          const takerBuyVolume = +(totalVolume - buyerMakerVolume).toFixed(4);
          const takerSellVolume = +buyerMakerVolume.toFixed(4);

          return {
            symbol: symbol.toUpperCase(),
            summary: {
              tradeCount: trades.length,
              totalVolume: +totalVolume.toFixed(4),
              takerBuyVolume,
              takerSellVolume,
              buyRatio: totalVolume > 0 ? +((takerBuyVolume / totalVolume) * 100).toFixed(1) : 50,
            },
            trades,
          };
        }, 'Failed to retrieve recent trades'),
    }),

    get_open_interest: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getOpenInterest,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Trading pair or perpetual contract symbol in uppercase (e.g. BTCUSDT, SOLUSDT)'),
      }),
      execute: async ({ symbol }) =>
        safeToolExecute(async () => {
          const result = await getOpenInterest(symbol.toUpperCase());
          return { data: result };
        }, 'Failed to retrieve open interest'),
    }),

    get_global_long_short_ratio: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getGlobalLongShortRatio,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Perpetual contract symbol in uppercase (e.g. BTCUSDT, ETHUSDT, SOLUSDT)'),
        period: z
          .enum(['5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d'])
          .default('5m')
          .describe('Granularity timeframe interval (default: 5m)'),
        limit: z
          .coerce
          .number({ message: 'Limit must be a number' })
          .int('Limit must be an integer')
          .min(1, 'Limit must be at least 1')
          .max(100, 'Limit cannot exceed 100')
          .default(30)
          .describe('Number of historical ratio points to fetch (1-100, default 30)'),
      }),
      execute: async ({ symbol, period, limit }) =>
        safeToolExecute(async () => {
          const history = await getGlobalLongShortAccountRatio(symbol.toUpperCase(), period, limit);
          const latest = history[history.length - 1];
          const rawLong = latest ? latest.longAccount * 100 : 50;
          const rawShort = latest ? latest.shortAccount * 100 : 50;
          const rawRatio = latest ? latest.longShortRatio : 1.0;
          const longPercent = Number.isFinite(rawLong) ? +rawLong.toFixed(1) : 50;
          const shortPercent = Number.isFinite(rawShort) ? +rawShort.toFixed(1) : 50;
          const ratio = Number.isFinite(rawRatio) ? +rawRatio.toFixed(2) : 1.0;
          const sentiment = ratio > 1.1 ? 'bullish' : ratio < 0.9 ? 'bearish' : 'neutral';

          return {
            symbol: symbol.toUpperCase(),
            period,
            summary: {
              longPercent,
              shortPercent,
              longShortRatio: ratio,
              sentiment,
              latestTimestamp: latest?.timestamp ?? Date.now(),
            },
            history: history.slice(-5),
          };
        }, 'Failed to retrieve global long/short account ratio'),
    }),

    get_top_long_short_ratio: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getTopLongShortRatio,
      inputSchema: z.object({
        symbol: symbolSchema.describe('Perpetual contract symbol in uppercase (e.g. BTCUSDT, ETHUSDT, SOLUSDT)'),
        period: z
          .enum(['5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d'])
          .default('5m')
          .describe('Granularity timeframe interval (default: 5m)'),
        limit: z
          .coerce
          .number({ message: 'Limit must be a number' })
          .int('Limit must be an integer')
          .min(1, 'Limit must be at least 1')
          .max(100, 'Limit cannot exceed 100')
          .default(30)
          .describe('Number of historical ratio points to fetch (1-100, default 30)'),
      }),
      execute: async ({ symbol, period, limit }) =>
        safeToolExecute(async () => {
          const history = await getTopLongShortPositionRatio(symbol.toUpperCase(), period, limit);
          const latest = history[history.length - 1];
          const rawLong = latest ? latest.longPosition * 100 : 50;
          const rawShort = latest ? latest.shortPosition * 100 : 50;
          const rawRatio = latest ? latest.longShortRatio : 1.0;
          const longPercent = Number.isFinite(rawLong) ? +rawLong.toFixed(1) : 50;
          const shortPercent = Number.isFinite(rawShort) ? +rawShort.toFixed(1) : 50;
          const ratio = Number.isFinite(rawRatio) ? +rawRatio.toFixed(2) : 1.0;
          const sentiment = ratio > 1.1 ? 'bullish' : ratio < 0.9 ? 'bearish' : 'neutral';

          return {
            symbol: symbol.toUpperCase(),
            period,
            summary: {
              longPercent,
              shortPercent,
              longShortRatio: ratio,
              sentiment,
              latestTimestamp: latest?.timestamp ?? Date.now(),
            },
            history: history.slice(-5),
          };
        }, 'Failed to retrieve top trader long/short position ratio'),
    }),

    search_crypto_news: tool({
      description: AGENT_TOOL_DESCRIPTIONS.searchCryptoNews,
      inputSchema: ExaSearchInputSchema,
      execute: async ({
        query,
        symbol,
        category = 'news',
        startPublishedDate,
        endPublishedDate,
        includeDomains,
        numResults = 3,
        includeText = true,
        highlightsPerUrl = 2,
      }) =>
        safeToolExecute(async () => {
          let cleanSymbol: string | undefined;
          if (symbol) {
            try {
              cleanSymbol = normalizeSymbol(symbol);
            } catch {
              const sanitized = symbol.replace(/[^a-zA-Z0-9]/g, '').trim().toUpperCase();
              if (sanitized && sanitized.length <= 10) {
                cleanSymbol = sanitized;
              }
            }
          }

          const searchQuery = cleanSymbol ? `${cleanSymbol} crypto ${query}` : query;
          const searchRes = await searchExa({
            query: searchQuery,
            type: 'auto',
            numResults,
            category,
            startPublishedDate,
            endPublishedDate,
            includeDomains,
            includeText,
            highlightsPerUrl,
          });

          return {
            query: searchQuery,
            category: searchRes.category,
            symbol: cleanSymbol,
            totalResults: searchRes.totalResults,
            warning: searchRes.warning,
            articles: searchRes.results.map((r) => ({
              id: r.id,
              title: r.title,
              url: r.url,
              publishedDate: r.publishedDate,
              author: r.author,
              highlights: r.highlights,
              text: r.text,
            })),
          };
        }, 'Failed to execute web search'),
    }),
  };
}
