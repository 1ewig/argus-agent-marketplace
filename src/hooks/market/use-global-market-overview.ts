'use client';

import { useQuery } from '@tanstack/react-query';
import { globalMarketQuery } from '@/lib/queries';
import type { GlobalMarketOverviewData } from '@/lib/types';

export interface UseGlobalMarketOverviewOptions {
  enabled?: boolean;
}

export interface UseGlobalMarketOverviewResult {
  data: GlobalMarketOverviewData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Reactive hook for streaming and polling the Global Market Overview across the core universe.
 */
export function useGlobalMarketOverview(
  options: UseGlobalMarketOverviewOptions = {}
): UseGlobalMarketOverviewResult {
  const { enabled = true } = options;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery(globalMarketQuery.options(enabled));

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: () => void refetch(),
  };
}
