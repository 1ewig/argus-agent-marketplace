'use client';

import React, { memo, useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  Layers,
  Coins,
  Grid3x3,
  Activity,
  Trophy,
  Flame,
  Sparkles,
  Clock,
  RefreshCcw,
  Zap,
  Bot,
  TrendingUp,
  HeartPulse,
  Eye,
  CandlestickChart,
  Search,
  BarChart3,
  ShieldAlert,
  ArrowLeftRight,
  HardDrive,
  Landmark,
  Folder,
  Check,
  ArrowUpDown,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { CATEGORIES } from '@/lib/8004scan/categories';
import type { MarketplaceTab } from '@/lib/8004scan/types';

export interface MarketplaceFilterBarProps {
  selectedTab: MarketplaceTab;
  onSelectTab: (tab: MarketplaceTab) => void;
}

interface SortOption {
  id: MarketplaceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  TrendingUp,
  Grid3x3,
  HeartPulse,
  Eye,
  Zap,
  Bot,
  CandlestickChart,
  Activity,
  RefreshCcw,
  Coins,
  Search,
  BarChart3,
  ShieldAlert,
  Flame,
  ArrowLeftRight,
  HardDrive,
  Landmark,
  Folder,
};

const SORT_OPTIONS: SortOption[] = [
  { id: 'leaderboard', label: APP_CONTENT.marketplace.tabs.leaderboard, icon: Trophy },
  { id: 'trending', label: APP_CONTENT.marketplace.tabs.trending, icon: Flame },
  { id: 'featured', label: APP_CONTENT.marketplace.tabs.featured, icon: Sparkles },
  { id: 'latest', label: APP_CONTENT.marketplace.tabs.latest, icon: Clock },
];

export const MarketplaceFilterBar = memo(function MarketplaceFilterBar({
  selectedTab,
  onSelectTab,
}: MarketplaceFilterBarProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const categoryRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click and reset search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
        setCategorySearch('');
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine active category label & icon
  const activeCategory = CATEGORIES.find((c) => c.key === selectedTab);
  const isCategoryFiltered = Boolean(activeCategory && activeCategory.key !== 'all');
  const categoryLabel = activeCategory
    ? APP_CONTENT.marketplace.tabs[
    activeCategory.key as keyof typeof APP_CONTENT.marketplace.tabs
    ] || activeCategory.label
    : APP_CONTENT.marketplace.tabs.all || 'All Categories';

  const CategoryTriggerIcon = activeCategory
    ? ICON_MAP[activeCategory.icon] ?? Folder
    : Folder;

  // Determine active sort label & icon
  const activeSort = SORT_OPTIONS.find((s) => s.id === selectedTab);
  const sortLabel = activeSort?.label ?? APP_CONTENT.marketplace.tabs.leaderboard;
  const SortTriggerIcon = activeSort?.icon ?? ArrowUpDown;

  // Filtered categories for quick search
  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    const nonAllCategories = CATEGORIES.filter((c) => c.key !== 'all');
    if (!query) return nonAllCategories;

    return nonAllCategories.filter((cat) => {
      const label = (
        APP_CONTENT.marketplace.tabs[
        cat.key as keyof typeof APP_CONTENT.marketplace.tabs
        ] || cat.label
      ).toLowerCase();
      return label.includes(query) || cat.key.toLowerCase().includes(query);
    });
  }, [categorySearch]);

  const handleSelectCategory = (key: MarketplaceTab) => {
    onSelectTab(key);
    setIsCategoryOpen(false);
    setCategorySearch('');
  };

  return (
    <div className="w-full bg-theme-bg-surface/50 border-b border-theme-border-subtle/80 px-4 sm:px-6 py-3 flex items-center justify-end gap-2">
      {/* 1. File Sort / Category Dropdown */}
      <div className="relative shrink-0" ref={categoryRef}>
        <button
          type="button"
          onClick={() => {
            setIsCategoryOpen((prev) => !prev);
            setIsSortOpen(false);
            setCategorySearch('');
          }}
          className={`h-7.5 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all border ${isCategoryFiltered
              ? 'bg-theme-bg-elevated text-theme-brand-binance border-theme-brand-binance/35 font-semibold'
              : 'bg-theme-bg-elevated/40 text-theme-text-secondary hover:text-theme-text-primary border-theme-border-subtle'
            }`}
          aria-expanded={isCategoryOpen}
          aria-haspopup="listbox"
        >
          <CategoryTriggerIcon
            className={`size-3.5 shrink-0 ${isCategoryFiltered ? 'text-theme-brand-binance' : 'text-theme-text-muted'
              }`}
          />
          <span className="text-theme-text-muted">
            {APP_CONTENT.marketplace.tabs.categoryBy}:
          </span>
          <span className="truncate max-w-[120px]">{categoryLabel}</span>
          <ChevronDown
            className={`size-3 text-theme-text-muted transition-transform duration-150 ${isCategoryOpen ? 'rotate-180' : ''
              }`}
          />
        </button>

        {isCategoryOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-60 bg-theme-bg-surface/95 backdrop-blur-md border border-theme-border-subtle rounded-xl shadow-2xl z-30 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Explorer-style Search Box */}
            <div className="p-1.5 border-b border-theme-border-subtle/50">
              <div className="relative flex items-center">
                <Search className="size-3 text-theme-text-muted absolute left-2 pointer-events-none" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Filter categories..."
                  autoFocus
                  className="w-full pl-6.5 pr-2 py-1 text-xs bg-theme-bg-elevated/50 border border-theme-border-subtle/40 rounded-md text-theme-text-primary placeholder:text-theme-text-muted focus:outline-none focus:border-theme-brand-binance/50 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Explorer Header */}
            <div className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-wider text-theme-text-muted flex items-center justify-between border-b border-theme-border-subtle/30 bg-theme-bg-elevated/20">
              <span>Categories</span>
              <span>{filteredCategories.length}</span>
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto p-1 flex flex-col gap-0.5">
              {/* Pinned 'All' Category */}
              {!categorySearch && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('all' as MarketplaceTab)}
                    className={`h-8 w-full px-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors text-left ${selectedTab === 'all'
                        ? 'bg-theme-bg-elevated text-theme-brand-binance font-semibold'
                        : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/50'
                      }`}
                  >
                    <Layers
                      className={`size-3.5 shrink-0 ${selectedTab === 'all'
                          ? 'text-theme-brand-binance'
                          : 'text-theme-text-muted'
                        }`}
                    />
                    <span className="flex-1 truncate">
                      {APP_CONTENT.marketplace.tabs.all || 'All Categories'}
                    </span>
                    {selectedTab === 'all' && (
                      <Check className="size-3.5 text-theme-brand-binance shrink-0" />
                    )}
                  </button>
                  <div className="h-px bg-theme-border-subtle/40 my-0.5" />
                </>
              )}

              {/* Categorized Items */}
              {filteredCategories.map((cat) => {
                const Icon = ICON_MAP[cat.icon] ?? Folder;
                const isCurrent = selectedTab === cat.key;
                const label =
                  APP_CONTENT.marketplace.tabs[
                  cat.key as keyof typeof APP_CONTENT.marketplace.tabs
                  ] || cat.label;

                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => handleSelectCategory(cat.key)}
                    className={`h-8 w-full px-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors text-left ${isCurrent
                        ? 'bg-theme-bg-elevated text-theme-brand-binance font-semibold'
                        : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/50'
                      }`}
                  >
                    <Icon
                      className={`size-3.5 shrink-0 ${isCurrent
                          ? 'text-theme-brand-binance'
                          : 'text-theme-text-muted'
                        }`}
                    />
                    <span className="flex-1 truncate">{label}</span>
                    {isCurrent && (
                      <Check className="size-3.5 text-theme-brand-binance shrink-0" />
                    )}
                  </button>
                );
              })}

              {filteredCategories.length === 0 && (
                <div className="py-4 px-2 text-center text-xs text-theme-text-muted">
                  No matching category
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Sleek Sort Dropdown */}
      <div className="relative shrink-0" ref={sortRef}>
        <button
          type="button"
          onClick={() => {
            setIsSortOpen((prev) => !prev);
            setIsCategoryOpen(false);
          }}
          className={`h-7.5 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all border ${activeSort
              ? 'bg-theme-bg-elevated text-theme-brand-binance border-theme-brand-binance/35 font-semibold'
              : 'bg-theme-bg-elevated/40 text-theme-text-secondary hover:text-theme-text-primary border-theme-border-subtle'
            }`}
          aria-expanded={isSortOpen}
          aria-haspopup="listbox"
        >
          <SortTriggerIcon
            className={`size-3.5 shrink-0 ${activeSort ? 'text-theme-brand-binance' : 'text-theme-text-muted'
              }`}
          />
          <span className="text-theme-text-muted">
            {APP_CONTENT.marketplace.tabs.sortBy}:
          </span>
          <span className="truncate max-w-[110px]">{sortLabel}</span>
          <ChevronDown
            className={`size-3 text-theme-text-muted transition-transform duration-150 ${isSortOpen ? 'rotate-180' : ''
              }`}
          />
        </button>

        {isSortOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-44 bg-theme-bg-surface/95 backdrop-blur-md border border-theme-border-subtle rounded-xl shadow-2xl p-1 z-30 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            {SORT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isCurrent = selectedTab === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(opt.id);
                    setIsSortOpen(false);
                  }}
                  className={`h-8 w-full px-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors text-left ${isCurrent
                      ? 'bg-theme-bg-elevated text-theme-brand-binance font-semibold'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/50'
                    }`}
                >
                  <Icon
                    className={`size-3.5 shrink-0 ${isCurrent
                        ? 'text-theme-brand-binance'
                        : 'text-theme-text-muted'
                      }`}
                  />
                  <span className="flex-1 truncate">{opt.label}</span>
                  {isCurrent && (
                    <Check className="size-3.5 text-theme-brand-binance shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});