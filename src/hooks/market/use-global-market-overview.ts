'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { globalMarketQuery, fetchGlobalMarketOverview } from '@/lib/queries';
import type { GlobalMarketOverviewData } from '@/lib/types';

export interface UseGlobalMarketOverviewOptions {
  enabled?: boolean;
}

export interface UseGlobalMarketOverviewResult {
  data: GlobalMarketOverviewData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isRefreshing: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  handleRefresh: () => Promise<void>;
}

/**
 * Reactive hook for streaming and polling the Global Market Overview across the core universe.
 */
export function useGlobalMarketOverview(
  options: UseGlobalMarketOverviewOptions = {}
): UseGlobalMarketOverviewResult {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: queryRefetch,
  } = useQuery(globalMarketQuery.options(enabled));

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const freshData = await fetchGlobalMarketOverview({ force: true });
      queryClient.setQueryData(globalMarketQuery.all, freshData);
      await minDelay;
    } catch {
      // If force fetch failed, fall back to standard refetch
      await Promise.allSettled([queryRefetch(), minDelay]);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, queryClient, queryRefetch]);

  const refetch = useCallback(async () => {
    await handleRefresh();
  }, [handleRefresh]);

  return {
    data,
    isLoading,
    isFetching: isFetching || isRefreshing,
    isRefreshing,
    isError,
    error,
    refetch,
    handleRefresh,
  };
}
