'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentsQuery } from '@/lib/queries/agents.query';
import type { DiscoveryCategory, ScanAgentItem } from '@/lib/8004scan/types';

export type MarketplaceTab =
  | 'all'
  | 'yield_optimisation'
  | 'grid_trading'
  | 'rebalancing'
  | 'health_factor'
  | 'monitoring'
  | 'security'
  | 'payments'
  | 'cross_agent'
  | 'leaderboard'
  | 'trending'
  | 'featured'
  | 'latest';

export interface UseAgentMarketplaceReturn {
  // Filters & State
  selectedTab: MarketplaceTab;
  setSelectedTab: (tab: MarketplaceTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  selectedAgent: ScanAgentItem | null;
  setSelectedAgent: (agent: ScanAgentItem | null) => void;

  // Pagination
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  totalPages: number;

  // Data & Status
  agents: ScanAgentItem[];
  totalCount: number;
  spotlightHevo: ScanAgentItem[];
  spotlightAlpha: ScanAgentItem[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const PAGE_SIZE = 24;

export function useAgentMarketplace(): UseAgentMarketplaceReturn {
  const [selectedTab, setSelectedTabState] = useState<MarketplaceTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<ScanAgentItem | null>(null);
  const [page, setPage] = useState(0);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const setSelectedTab = useCallback((tab: MarketplaceTab) => {
    setSelectedTabState(tab);
    setPage(0);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(0);
  }, []);

  // Determine query parameters from active tab
  const queryParams = useMemo(() => {
    if (debouncedSearch) {
      return {
        search: debouncedSearch,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      };
    }

    if (
      selectedTab === 'yield_optimisation' ||
      selectedTab === 'grid_trading' ||
      selectedTab === 'rebalancing' ||
      selectedTab === 'health_factor' ||
      selectedTab === 'monitoring' ||
      selectedTab === 'security' ||
      selectedTab === 'payments' ||
      selectedTab === 'cross_agent'
    ) {
      return {
        feed: 'category',
        category: selectedTab as DiscoveryCategory,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      };
    }

    if (
      selectedTab === 'leaderboard' ||
      selectedTab === 'trending' ||
      selectedTab === 'featured' ||
      selectedTab === 'latest'
    ) {
      return {
        feed: selectedTab,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      };
    }

    return {
      feed: 'all',
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    };
  }, [debouncedSearch, selectedTab, page]);

  // Main agents query
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery(agentsQuery.list(queryParams));

  // Spotlight agents query (Hevo & 4LPHA)
  const { data: spotlightData } = useQuery(agentsQuery.spotlight());

  const agents = useMemo(() => listData?.items ?? [], [listData?.items]);
  const totalCount = listData?.total ?? agents.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const spotlightHevo = useMemo(
    () => spotlightData?.spotlight?.hevo ?? [],
    [spotlightData?.spotlight?.hevo],
  );
  const spotlightAlpha = useMemo(
    () => spotlightData?.spotlight?.alpha ?? [],
    [spotlightData?.spotlight?.alpha],
  );

  return {
    selectedTab,
    setSelectedTab,
    searchQuery,
    setSearchQuery,
    clearSearch,
    selectedAgent,
    setSelectedAgent,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    totalPages,
    agents,
    totalCount,
    spotlightHevo,
    spotlightAlpha,
    isLoading: isListLoading,
    isFetching,
    isError,
    error: error as Error | null,
    refetch,
  };
}
