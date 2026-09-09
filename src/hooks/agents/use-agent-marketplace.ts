'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentsQuery } from '@/lib/queries/agents.query';
import { isDiscoveryCategory } from '@/lib/8004scan/categories';
import type {
  CategoryKey,
  MarketplaceSortKey,
  MarketplaceTab,
  ScanAgentItem,
} from '@/lib/8004scan/types';

export interface UseAgentMarketplaceReturn {
  // Filters & State
  selectedCategory: CategoryKey;
  setSelectedCategory: (category: CategoryKey) => void;
  selectedSort: MarketplaceSortKey;
  setSelectedSort: (sort: MarketplaceSortKey) => void;
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
  const [selectedCategory, setSelectedCategoryState] = useState<CategoryKey>('all');
  const [selectedSort, setSelectedSortState] = useState<MarketplaceSortKey>('leaderboard');
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

  const setSelectedCategory = useCallback((category: CategoryKey) => {
    setSelectedCategoryState(category);
    setPage(0);
  }, []);

  const setSelectedSort = useCallback((sort: MarketplaceSortKey) => {
    setSelectedSortState(sort);
    setPage(0);
  }, []);

  // Backwards-compatible tab setter
  const setSelectedTab = useCallback(
    (tab: MarketplaceTab) => {
      if (tab === 'all' || isDiscoveryCategory(tab)) {
        setSelectedCategory(tab);
      } else {
        setSelectedSort(tab as MarketplaceSortKey);
      }
    },
    [setSelectedCategory, setSelectedSort],
  );

  const selectedTab: MarketplaceTab =
    selectedCategory !== 'all' ? selectedCategory : selectedSort;

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(0);
  }, []);

  // Determine query parameters with composable category and sort
  const queryParams = useMemo(() => {
    const params = {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      sort: selectedSort,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      search: debouncedSearch || undefined,
    };

    return params;
  }, [debouncedSearch, selectedCategory, selectedSort, page]);

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

  const agents: ScanAgentItem[] = useMemo(
    () => listData?.items ?? [],
    [listData?.items],
  );

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
    selectedCategory,
    setSelectedCategory,
    selectedSort,
    setSelectedSort,
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
