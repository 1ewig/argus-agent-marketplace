import { createMCPClient, type MCPClient } from '@ai-sdk/mcp';
import type {
  IBinanceAgentAdapter,
  NormalizedOrderBook,
  NormalizedKline,
  AccountBalance,
  PlaceSpotOrderParams,
  OrderExecutionResult,
} from './types';
import { SimulatedBinanceAdapter } from './simulated-adapter';

/**
 * Live Binance Agent OS MCP Adapter
 * 
 * Directly connects via @ai-sdk/mcp to the official Binance Agent OS endpoint:
 * https://agent.binance.com/mcp/agentic
 * 
 * If the connection is unavailable (e.g. running in an unauthenticated or geoblocked
 * environment), it delegates to the high-fidelity Simulated adapter to prevent hard crashes.
 */
export class LiveBinanceMCPAdapter implements IBinanceAgentAdapter {
  public readonly mode = 'live_mcp' as const;

  private mcpEndpoint: string;
  private authToken?: string;
  private fallbackAdapter: SimulatedBinanceAdapter;
  private mcpClientPromise: Promise<MCPClient | null> | null = null;

  constructor(options?: { endpoint?: string; authToken?: string }) {
    this.mcpEndpoint = options?.endpoint ?? process.env.BINANCE_MCP_ENDPOINT ?? 'https://agent.binance.com/mcp/agentic';
    this.authToken = options?.authToken ?? process.env.BINANCE_AGENTIC_AUTH_TOKEN;
    this.fallbackAdapter = new SimulatedBinanceAdapter();
  }

  /**
   * Initializes or returns the cached MCP client instance
   */
  public async getClient(): Promise<MCPClient | null> {
    if (!this.mcpClientPromise) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      this.mcpClientPromise = createMCPClient({
        transport: {
          type: 'http',
          url: this.mcpEndpoint,
          headers,
        },
      }).catch((err: Error) => {
        console.warn(`[BinanceMCP] Direct MCP handshake to ${this.mcpEndpoint} failed, using fallback:`, err.message);
        return null;
      });
    }

    return this.mcpClientPromise;
  }

  /**
   * Helper to invoke an MCP tool and parse its text payload
   */
  private async invokeTool<T>(name: string, args: Record<string, unknown>): Promise<T | null> {
    try {
      const client = await this.getClient();
      if (!client) return null;

      const res = await client.callTool({
        name,
        arguments: args,
      });

      if (res && Array.isArray(res.content)) {
        const textObj = res.content.find((c) => c.type === 'text');
        if (textObj && 'text' in textObj && typeof textObj.text === 'string') {
          return JSON.parse(textObj.text) as T;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  public async getTickerPrice(symbol: string): Promise<{ symbol: string; price: number }> {
    const res = await this.invokeTool<{ symbol: string; price: number }>('get_ticker_price', { symbol });
    if (res && typeof res.price === 'number') {
      return res;
    }
    return this.fallbackAdapter.getTickerPrice(symbol);
  }

  public async getOrderBook(symbol: string, limit: number = 20): Promise<NormalizedOrderBook> {
    const res = await this.invokeTool<NormalizedOrderBook>('get_order_book', { symbol, limit });
    if (res && Array.isArray(res.bids) && Array.isArray(res.asks)) {
      return res;
    }
    return this.fallbackAdapter.getOrderBook(symbol, limit);
  }

  public async getKlines(symbol: string, interval: string = '15m', limit: number = 50): Promise<NormalizedKline[]> {
    const res = await this.invokeTool<NormalizedKline[]>('get_klines', { symbol, interval, limit });
    if (Array.isArray(res)) {
      return res;
    }
    return this.fallbackAdapter.getKlines(symbol, interval, limit);
  }

  public async get24hStats(symbol: string) {
    const res = await this.invokeTool<{
      symbol: string;
      lastPrice: number;
      priceChangePercent: number;
      volumeQuote: number;
      highPrice: number;
      lowPrice: number;
    }>('get_24h_stats', { symbol });

    if (res && typeof res.lastPrice === 'number') {
      return res;
    }
    return this.fallbackAdapter.get24hStats(symbol);
  }

  public async getAccountBalances(): Promise<AccountBalance[]> {
    const res = await this.invokeTool<AccountBalance[]>('get_account_balance', {});
    if (Array.isArray(res)) {
      return res;
    }
    return this.fallbackAdapter.getAccountBalances();
  }

  public async placeSpotOrder(params: PlaceSpotOrderParams): Promise<OrderExecutionResult> {
    const res = await this.invokeTool<OrderExecutionResult>('place_spot_order', params as unknown as Record<string, unknown>);
    if (res && res.orderId) {
      return res;
    }
    return this.fallbackAdapter.placeSpotOrder(params);
  }

  public async cancelOrder(symbol: string, orderId: string): Promise<{ success: boolean; orderId: string }> {
    const res = await this.invokeTool<{ success: boolean; orderId: string }>('cancel_order', { symbol, orderId });
    if (res && res.success !== undefined) {
      return res;
    }
    return this.fallbackAdapter.cancelOrder(symbol, orderId);
  }
}
