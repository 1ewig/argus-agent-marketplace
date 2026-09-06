import { queryOptions } from '@tanstack/react-query';
import type { BinanceSymbolItem } from '@/app/api/binance/symbols/route';

export interface SymbolsApiResponse {
  success: boolean;
  count: number;
  symbols: BinanceSymbolItem[];
  warning?: string;
}

/**
 * Pure network transport for fetching the active Binance USDT spot symbol catalog.
 */
export async function fetchSymbols(): Promise<SymbolsApiResponse> {
  const res = await fetch('/api/binance/symbols');
  if (!res.ok) {
    throw new Error(`Failed to fetch trading symbols (${res.status})`);
  }
  return res.json();
}

/**
 * Type-safe query keys and query options factory for Binance USDT symbols.
 */
export const symbolsQuery = {
  all: ['binance-usdt-symbols'] as const,
  options: (enabled: boolean = true) =>
    queryOptions({
      queryKey: symbolsQuery.all,
      queryFn: fetchSymbols,
      staleTime: 1000 * 60 * 60, // 1 hour
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      enabled,
    }),
};
