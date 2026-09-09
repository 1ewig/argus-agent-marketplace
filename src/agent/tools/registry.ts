import { tool } from 'ai';
import { z } from 'zod';
import {
  normalizeSymbol,
  getTickerPrice,
  getOrderBook,
  getKlines,
  get24hStats,
  getFundingRate,
  getOpenInterest,
  getTopLongShortPositionRatio,
} from '@/lib/binance-mcp';
import { searchExa, ExaSearchInputSchema } from '@/lib/exa';
import {
  getAgentDetail,
  searchAgents,
} from '@/lib/8004scan/client';
import { get8004ScanAgentUrl } from '@/lib/8004scan/categories';
import { loadFallbackData } from '@/lib/8004scan/fallback';
import { resolveMarketplaceAgents } from '@/lib/8004scan/service';
import type {
  DiscoveryCategory,
  MarketplaceSortKey,
  ScanAgentItem,
} from '@/lib/8004scan/types';
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

    get_agent_telemetry: tool({
      description: AGENT_TOOL_DESCRIPTIONS.getAgentTelemetry,
      inputSchema: z.object({
        tokenId: z
          .string()
          .describe('ERC-8004 Token ID (e.g. "340533", "341092")'),
        name: z
          .string()
          .optional()
          .describe('Optional name of the agent (e.g. "Hevo Sentinel", "4LPHA")'),
      }),
      execute: async ({ tokenId, name }) =>
        safeToolExecute(async () => {
          let agent: ScanAgentItem | null = null;
          const cleanTokenId = tokenId.replace(/[^0-9]/g, '').trim();

          if (cleanTokenId) {
            try {
              agent = await getAgentDetail(cleanTokenId);
            } catch {
              const fallbackItems = await loadFallbackData();
              agent = fallbackItems.find((a) => a.token_id === cleanTokenId) ?? null;
            }
          }

          if (!agent && name) {
            try {
              const searchRes = await searchAgents(name, { limit: 1 });
              agent = searchRes.items?.[0] ?? null;
            } catch {
              const fallbackItems = await loadFallbackData();
              agent =
                fallbackItems.find(
                  (a) => a.name?.toLowerCase() === name.toLowerCase(),
                ) ?? null;
            }
          }

          if (!agent) {
            return {
              found: false,
              tokenId: cleanTokenId || tokenId,
              name: name ?? null,
              message: `No registered ERC-8004 agent found on BNB Chain matching Token ID #${cleanTokenId || tokenId}.`,
            };
          }

          return {
            found: true,
            tokenId: agent.token_id,
            name: agent.name || `Agent #${agent.token_id}`,
            description: agent.description,
            contractAddress: agent.contract_address,
            ownerAddress: agent.owner_address,
            ownerEns: agent.owner_ens,
            isVerified: agent.is_verified ?? true,
            totalScore: agent.total_score ?? 0,
            healthScore: agent.health_score ?? 100,
            rank: agent.rank ?? null,
            averageScore: agent.average_score ?? 0,
            totalFeedbacks: agent.total_feedbacks ?? 0,
            starCount: agent.star_count ?? 0,
            supportedProtocols: agent.supported_protocols ?? [],
            x402Supported: agent.x402_supported ?? false,
            createdAt: agent.created_at,
            updatedAt: agent.updated_at,
            network: 'BNB Smart Chain (BSC - Chain ID 56)',
            standard: 'ERC-8004 On-Chain Agent Registry',
            bscScanUrl: `https://bscscan.com/token/${agent.contract_address}?a=${agent.token_id}`,
            scan8004Url: get8004ScanAgentUrl(agent.chain_id || 56, agent.token_id),
          };
        }, 'Failed to retrieve ERC-8004 agent telemetry'),
    }),

    search_agent_marketplace: tool({
      description: AGENT_TOOL_DESCRIPTIONS.searchAgentMarketplace,
      inputSchema: z.object({
        query: z
          .string()
          .default('')
          .describe('Search query keyword, name, or protocol to search (e.g. "Venus", "yield", "grid", "rebalancer", "PancakeSwap")'),
        category: z
          .enum([
            'all',
            'yield',
            'grid',
            'health',
            'rebalancing',
            'trading',
            'risk',
            'monitoring',
            'research',
            'infrastructure',
            'derivatives',
            'liquid_staking',
            'analytics',
            'payments',
            'cross_agent',
            'cross_chain',
            'depin_storage',
            'meme_social',
            'governance',
          ])
          .default('all')
          .describe('Filter by ecosystem category / track (e.g. yield, grid, health, rebalancing)'),
        sortBy: z
          .enum(['leaderboard', 'trending', 'featured', 'latest', 'newest'])
          .default('leaderboard')
          .describe('Sort order for agents (e.g. leaderboard, trending, newest)'),
        limit: z
          .coerce
          .number()
          .min(1)
          .max(20)
          .default(6)
          .describe('Maximum number of agents to return (1-20, default 6)'),
      }),
      execute: async ({ query, category, sortBy, limit }) =>
        safeToolExecute(async () => {
          const res = await resolveMarketplaceAgents({
            rawFeed: category !== 'all' ? 'category' : 'all',
            category: category !== 'all' ? (category as DiscoveryCategory) : null,
            sort: sortBy as MarketplaceSortKey,
            search: query.trim(),
            limit,
            offset: 0,
            cacheKey: `tool:${query}:${category}:${sortBy}:${limit}`,
          });

          const agents = (res.items || []).slice(0, limit).map((a) => ({
            tokenId: a.token_id,
            name: a.name || `Agent #${a.token_id}`,
            description: a.description,
            contractAddress: a.contract_address,
            ownerAddress: a.owner_address,
            ownerEns: a.owner_ens,
            totalScore: a.total_score ?? 0,
            healthScore: a.health_score ?? 100,
            rank: a.rank ?? null,
            averageScore: a.average_score ?? 0,
            totalFeedbacks: a.total_feedbacks ?? 0,
            supportedProtocols: a.supported_protocols ?? [],
            x402Supported: a.x402_supported ?? false,
            bscScanUrl: `https://bscscan.com/token/${a.contract_address}?a=${a.token_id}`,
            scan8004Url: get8004ScanAgentUrl(a.chain_id || 56, a.token_id),
          }));

          return {
            query: query || undefined,
            category: category !== 'all' ? category : undefined,
            sortBy,
            totalFound: res.total,
            returnedCount: agents.length,
            network: 'BNB Smart Chain (Chain ID 56)',
            agents,
          };
        }, 'Failed to search ERC-8004 agent marketplace'),
    }),
  };
}
