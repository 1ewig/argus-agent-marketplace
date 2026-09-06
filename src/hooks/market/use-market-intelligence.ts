'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStoredIntelligence } from '@/lib/db';
import {
  marketIntelligenceQuery,
  type MarketIntelligenceFetchOptions,
} from '@/lib/queries';
import type { MarketIntelligencePayload, MarketIntelligenceResponse } from '@/agent';

export type UseMarketIntelligenceOptions = MarketIntelligenceFetchOptions;

export interface UseMarketIntelligenceResult {
  symbol: string;
  response: MarketIntelligenceResponse | undefined;
  data: MarketIntelligencePayload | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Reactive hook orchestrating symbol-specific Market Intelligence fetching,
 * Dexie IndexedDB caching, and in-memory prewarming via marketIntelligenceQuery.
 */
export function useMarketIntelligence(
  symbol: string,
  options: UseMarketIntelligenceOptions = {}
): UseMarketIntelligenceResult {
  const cleanSymbol = symbol.trim().toUpperCase();

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery(marketIntelligenceQuery.options(cleanSymbol, options));

  // Async Dexie hydration if not in memory cache yet
  useEffect(() => {
    if (!response && cleanSymbol) {
      void getStoredIntelligence(cleanSymbol).then((persisted) => {
        if (persisted) {
          void refetch();
        }
      });
    }
  }, [cleanSymbol, response, refetch]);

  return {
    symbol: cleanSymbol,
    response,
    data: response?.data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: () => void refetch(),
  };
}
