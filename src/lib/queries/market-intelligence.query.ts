import { queryOptions } from '@tanstack/react-query';
import {
  getCachedIntelligence,
  saveStoredIntelligence,
  ONE_HOUR_MS,
} from '@/lib/db';
import type { MarketIntelligenceResponse } from '@/agent';

export interface MarketIntelligenceFetchOptions {
  apiKey?: string;
  providerOverride?: 'groq' | 'fireworks';
}

/**
 * Pure network transport for fetching live market intelligence analysis.
 */
export async function fetchMarketIntelligence(
  symbol: string,
  options?: MarketIntelligenceFetchOptions
): Promise<MarketIntelligenceResponse> {
  const cleanSymbol = symbol.trim().toUpperCase();

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Argus:MarketIntelligence] Requesting live scan for #${cleanSymbol}...`);
  }

  const res = await fetch('/api/agent/intelligence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbol: cleanSymbol,
      apiKey: options?.apiKey,
      providerOverride: options?.providerOverride,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch market intelligence (${res.status})`);
  }

  const data: MarketIntelligenceResponse = await res.json();

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Argus:MarketIntelligence] Scan received for #${cleanSymbol}`, data);
  }

  await saveStoredIntelligence(data);
  return data;
}

/**
 * Type-safe query keys and query options factory for Market Intelligence.
 */
export const marketIntelligenceQuery = {
  all: ['market-intelligence'] as const,
  detail: (symbol: string) => ['market-intelligence', symbol.trim().toUpperCase()] as const,
  options: (symbol: string, options?: MarketIntelligenceFetchOptions) => {
    const cleanSymbol = symbol.trim().toUpperCase();
    return queryOptions({
      queryKey: marketIntelligenceQuery.detail(cleanSymbol),
      queryFn: () => fetchMarketIntelligence(cleanSymbol, options),
      initialData: () => getCachedIntelligence(cleanSymbol) ?? undefined,
      initialDataUpdatedAt: () => getCachedIntelligence(cleanSymbol)?.timestamp,
      staleTime: ONE_HOUR_MS,
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    });
  },
};
