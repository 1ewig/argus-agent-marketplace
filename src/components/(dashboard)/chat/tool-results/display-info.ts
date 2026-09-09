import {
  TrendingUp,
  Layers,
  BarChart3,
  Activity,
  Sparkles,
  Percent,
  Calculator,
  History,
  Globe,
  Users,
  Crown,
  Bot,
  Search,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { ToolDisplayInfo } from './types';

/**
 * Derives natural, humanized tool titles and contextual icons using tool arguments.
 */
export function getToolDisplayInfo(
  toolName?: string,
  toolArgs?: Record<string, unknown>
): ToolDisplayInfo {
  const normalizedName = toolName ?? '';
  const symbol = typeof toolArgs?.symbol === 'string' ? toolArgs.symbol.toUpperCase() : undefined;
  const interval = typeof toolArgs?.interval === 'string' ? toolArgs.interval : undefined;

  const labels = APP_CONTENT.process.toolLabels;

  switch (normalizedName) {
    case 'get_ticker_price':
      return {
        title: labels.get_ticker_price(symbol),
        icon: TrendingUp,
        symbol,
      };
    case 'get_order_book':
      return {
        title: labels.get_order_book(symbol),
        icon: Layers,
        symbol,
      };
    case 'get_klines':
      return {
        title: labels.get_klines(symbol, interval),
        icon: BarChart3,
        symbol,
      };
    case 'get_24h_stats':
      return {
        title: labels.get_24h_stats(symbol),
        icon: Activity,
        symbol,
      };
    case 'get_funding_rate':
      return {
        title: labels.get_funding_rate(symbol),
        icon: Percent,
        symbol,
      };
    case 'get_average_price':
      return {
        title: labels.get_average_price(symbol),
        icon: Calculator,
        symbol,
      };
    case 'get_recent_trades':
      return {
        title: labels.get_recent_trades(symbol),
        icon: History,
        symbol,
      };
    case 'get_open_interest':
      return {
        title: labels.get_open_interest(symbol),
        icon: Layers,
        symbol,
      };
    case 'get_global_long_short_ratio':
      return {
        title: labels.get_global_long_short_ratio(symbol),
        icon: Users,
        symbol,
      };
    case 'get_top_long_short_ratio':
      return {
        title: labels.get_top_long_short_ratio(symbol),
        icon: Crown,
        symbol,
      };
    case 'search_crypto_news':
      return {
        title: labels.search_crypto_news(symbol),
        icon: Globe,
        symbol,
      };
    case 'get_agent_telemetry': {
      const tokenId = typeof toolArgs?.tokenId === 'string' ? toolArgs.tokenId : undefined;
      const name = typeof toolArgs?.name === 'string' ? toolArgs.name : undefined;
      return {
        title: labels.get_agent_telemetry(tokenId, name),
        icon: Bot,
        symbol: tokenId ? `#${tokenId}` : undefined,
      };
    }
    case 'search_agent_marketplace': {
      const query = typeof toolArgs?.query === 'string' ? toolArgs.query : undefined;
      const category = typeof toolArgs?.category === 'string' ? toolArgs.category : undefined;
      return {
        title: labels.search_agent_marketplace(query, category),
        icon: Search,
        symbol: query || category,
      };
    }
    default:
      return {
        title: labels.default(normalizedName || 'tool'),
        icon: Sparkles,
        symbol,
      };
  }
}
