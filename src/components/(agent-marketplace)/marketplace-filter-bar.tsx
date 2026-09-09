'use client';

import React, { memo, useState } from 'react';
import { isDiscoveryCategory } from '@/lib/8004scan/categories';
import type {
  CategoryKey,
  MarketplaceSortKey,
  MarketplaceTab,
} from '@/lib/8004scan/types';
import {
  MarketplaceSearchInput,
  CategoryDropdown,
  SortDropdown,
} from './(marketplace-filter-bar)';

export interface MarketplaceFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  selectedCategory?: CategoryKey;
  onSelectCategory?: (category: CategoryKey) => void;
  selectedSort?: MarketplaceSortKey;
  onSelectSort?: (sort: MarketplaceSortKey) => void;
  selectedTab?: MarketplaceTab;
  onSelectTab?: (tab: MarketplaceTab) => void;
}

export const MarketplaceFilterBar = memo(function MarketplaceFilterBar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
  selectedTab,
  onSelectTab,
}: MarketplaceFilterBarProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Compute decoupled category and sort with fallback to legacy selectedTab
  const currentCategory: CategoryKey =
    selectedCategory ??
    (selectedTab && (selectedTab === 'all' || isDiscoveryCategory(selectedTab))
      ? (selectedTab as CategoryKey)
      : 'all');

  const currentSort: MarketplaceSortKey =
    selectedSort ??
    (selectedTab && !isDiscoveryCategory(selectedTab) && selectedTab !== 'all'
      ? (selectedTab as MarketplaceSortKey)
      : 'leaderboard');

  const handleSelectCategory = (key: CategoryKey) => {
    if (onSelectCategory) {
      onSelectCategory(key);
    } else if (onSelectTab) {
      onSelectTab(key);
    }
  };

  const handleSelectSort = (sortKey: MarketplaceSortKey) => {
    if (onSelectSort) {
      onSelectSort(sortKey);
    } else if (onSelectTab) {
      onSelectTab(sortKey);
    }
  };

  return (
    <div className="w-full shrink-0 z-10 bg-theme-bg-surface/90 backdrop-blur-md border-b border-theme-border-subtle/80 px-4 sm:px-6 py-2.5 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
        <MarketplaceSearchInput
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onClearSearch={onClearSearch}
        />
        <CategoryDropdown
          currentCategory={currentCategory}
          onSelectCategory={handleSelectCategory}
          isOpen={isCategoryOpen}
          onToggleOpen={(open) => {
            setIsCategoryOpen(open);
            if (open) setIsSortOpen(false);
          }}
        />
        <SortDropdown
          currentSort={currentSort}
          onSelectSort={handleSelectSort}
          isOpen={isSortOpen}
          onToggleOpen={(open) => {
            setIsSortOpen(open);
            if (open) setIsCategoryOpen(false);
          }}
        />
      </div>
    </div>
  );
});