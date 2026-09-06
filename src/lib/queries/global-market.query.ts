import { queryOptions } from '@tanstack/react-query';
import type { GlobalMarketOverviewData, GlobalMarketOverviewResponse } from '@/lib/types';

export const THIRTY_SECONDS_MS = 30 * 1000;

/**
 * Pure network fetcher for live Global Market Overview.
 */
export async function fetchGlobalMarketOverview(): Promise<GlobalMarketOverviewData> {
  const res = await fetch('/api/binance/global-overview', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch global market overview (${res.status})`);
  }

  const json: GlobalMarketOverviewResponse = await res.json();
  if (!json.success || !json.data) {
    throw new Error('Invalid global market response received');
  }

  return json.data;
}

/**
 * Type-safe query keys and query options factory for Global Market Overview.
 */
export const globalMarketQuery = {
  all: ['global-market-overview'] as const,
  options: (enabled: boolean = true) => {
    return queryOptions({
      queryKey: globalMarketQuery.all,
      queryFn: fetchGlobalMarketOverview,
      staleTime: THIRTY_SECONDS_MS,
      gcTime: 5 * 60 * 1000,
      refetchInterval: 30 * 1000, // Background poll every 30s
      refetchOnWindowFocus: true,
      enabled,
    });
  },
};
