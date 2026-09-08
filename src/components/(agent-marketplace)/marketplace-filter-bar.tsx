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
  X,
  Wrench,
  Star,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { CATEGORIES, PRIMARY_PILLARS, SECONDARY_TAGS } from '@/lib/8004scan/categories';
import type { MarketplaceTab, SecondaryTagKey } from '@/lib/8004scan/types';

export interface MarketplaceFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  selectedTab: MarketplaceTab;
  onSelectTab: (tab: MarketplaceTab) => void;
  selectedTags?: SecondaryTagKey[];
  onToggleTag?: (tag: SecondaryTagKey) => void;
  onClearTags?: () => void;
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
  Wrench,
  Star,
  CheckCircle2,
};

const TAG_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Bot,
  CheckCircle2,
  Coins,
  RefreshCcw,
  Star,
};

const SORT_OPTIONS: SortOption[] = [
  { id: 'leaderboard', label: APP_CONTENT.marketplace.tabs.leaderboard, icon: Trophy },
  { id: 'trending', label: APP_CONTENT.marketplace.tabs.trending, icon: Flame },
  { id: 'featured', label: APP_CONTENT.marketplace.tabs.featured, icon: Sparkles },
  { id: 'latest', label: APP_CONTENT.marketplace.tabs.latest, icon: Clock },
];

export const MarketplaceFilterBar = memo(function MarketplaceFilterBar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  selectedTab,
  onSelectTab,
  selectedTags = [],
  onToggleTag,
  onClearTags,
}: MarketplaceFilterBarProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const globalSearchRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut '/' to focus global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        globalSearchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    : APP_CONTENT.marketplace.tabs.allCategories || 'All Categories';

  const CategoryTriggerIcon = activeCategory
    ? ICON_MAP[activeCategory.icon] ?? Folder
    : Folder;

  // Determine active sort label & icon
  const activeSort = SORT_OPTIONS.find((s) => s.id === selectedTab);
  const sortLabel = activeSort?.label ?? APP_CONTENT.marketplace.tabs.leaderboard;
  const SortTriggerIcon = activeSort?.icon ?? ArrowUpDown;

  // Primary pillars excluding 'all'
  const primaryPillarsList = useMemo(
    () => PRIMARY_PILLARS.filter((p) => p.key !== 'all'),
    [],
  );

  // Specialized categories that are not primary pillars
  const specializedCategoriesList = useMemo(
    () =>
      CATEGORIES.filter(
        (c) => c.key !== 'all' && !PRIMARY_PILLARS.some((p) => p.key === c.key),
      ),
    [],
  );

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
    <div className="w-full bg-theme-bg-surface/50 border-b border-theme-border-subtle/80 px-4 sm:px-6 py-2.5 flex flex-col gap-2">
      {/* Row 1: Search + Category Dropdown + Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
        {/* 1. Global Search */}
        <div className="relative w-full max-w-xs sm:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-theme-text-muted">
            <Search className="size-3.5" />
          </div>
          <input
            ref={globalSearchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={APP_CONTENT.marketplace.header.searchPlaceholder}
            className="w-full h-7.5 pl-8 pr-8 bg-theme-bg-elevated/50 hover:bg-theme-bg-elevated focus:bg-theme-bg-elevated border border-theme-border-subtle focus:border-theme-brand-binance/60 rounded-lg text-xs text-theme-text-primary placeholder:text-theme-text-muted outline-none transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            {searchQuery ? (
              <button
                type="button"
                onClick={onClearSearch}
                title={APP_CONTENT.marketplace.header.searchClear}
                className="size-5 rounded flex items-center justify-center text-theme-text-muted hover:text-theme-text-primary cursor-pointer transition-colors"
              >
                <X className="size-3" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center px-1 text-3xs font-mono text-theme-text-muted bg-theme-bg-base/60 rounded border border-theme-border-subtle/70">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* 2. File Sort / Category Dropdown */}
        <div className="relative shrink-0" ref={categoryRef}>
          <button
            type="button"
            onClick={() => {
              setIsCategoryOpen((prev) => !prev);
              setIsSortOpen(false);
              setCategorySearch('');
            }}
            className={`h-7.5 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all border ${
              isCategoryFiltered
                ? 'bg-theme-bg-elevated text-theme-brand-binance border-theme-brand-binance/35 font-semibold'
                : 'bg-theme-bg-elevated/40 text-theme-text-secondary hover:text-theme-text-primary border-theme-border-subtle'
            }`}
            aria-expanded={isCategoryOpen}
            aria-haspopup="listbox"
          >
            <CategoryTriggerIcon
              className={`size-3.5 shrink-0 ${
                isCategoryFiltered ? 'text-theme-brand-binance' : 'text-theme-text-muted'
              }`}
            />
            <span className="text-theme-text-muted">
              {APP_CONTENT.marketplace.tabs.categoryBy}:
            </span>
            <span className="truncate max-w-[120px]">{categoryLabel}</span>
            <ChevronDown
              className={`size-3 text-theme-text-muted transition-transform duration-150 ${
                isCategoryOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isCategoryOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-theme-bg-surface/95 backdrop-blur-md border border-theme-border-subtle rounded-xl shadow-2xl z-30 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {/* Explorer-style Search Box */}
              <div className="p-1.5 border-b border-theme-border-subtle/50">
                <div className="relative flex items-center">
                  <Search className="size-3 text-theme-text-muted absolute left-2 pointer-events-none" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder={APP_CONTENT.marketplace.tabs.filterPlaceholder}
                    autoFocus
                    className="w-full pl-6.5 pr-2 py-1 text-xs bg-theme-bg-elevated/50 border border-theme-border-subtle/40 rounded-md text-theme-text-primary placeholder:text-theme-text-muted focus:outline-none focus:border-theme-brand-binance/50 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Explorer Header */}
              <div className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-wider text-theme-text-muted flex items-center justify-between border-b border-theme-border-subtle/30 bg-theme-bg-elevated/20">
                <span>{APP_CONTENT.marketplace.tabs.categoryBy}</span>
                <span>{filteredCategories.length}</span>
              </div>

              {/* Options List */}
              <div className="max-h-72 overflow-y-auto p-1 flex flex-col gap-0.5">
                {/* When NO search query is typed: show clean hierarchical structure */}
                {!categorySearch ? (
                  <>
                    {/* 1. Pinned 'All Agents' */}
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('all' as MarketplaceTab)}
                      className={`h-8 w-full px-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors text-left ${
                        selectedTab === 'all'
                          ? 'bg-theme-bg-elevated text-theme-brand-binance font-semibold'
                          : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/50'
                      }`}
                    >
                      <Layers
                        className={`size-3.5 shrink-0 ${
                          selectedTab === 'all'
                            ? 'text-theme-brand-binance'
                            : 'text-theme-text-muted'
                        }`}
                      />
                      <span className="flex-1 truncate">
                        {APP_CONTENT.marketplace.tabs.allCategories}
                      </span>
                      {selectedTab === 'all' && (
                        <Check className="size-3.5 text-theme-brand-binance shrink-0" />
                      )}
                    </button>

                    <div className="h-px bg-theme-border-subtle/40 my-1" />

                    {/* 2. Core Pillars Section */}
                    <div className="px-2 py-1 text-[10px] uppercase font-semibold tracking-wider text-theme-text-muted/80">
                      {APP_CONTENT.marketplace.tabs.primaryPillarsHeader}
                    </div>

                    {primaryPillarsList.map((cat) => {
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
                          className={`h-8 w-full px-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors text-left ${
                            isCurrent
                              ? 'bg-theme-bg-elevated text-theme-brand-binance font-semibold'
                              : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/50'
                          }`}
                        >
                          <Icon
                            className={`size-3.5 shrink-0 ${
                              isCurrent
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

                    <div className="h-px bg-theme-border-subtle/40 my-1" />

                    {/* 3. Specialized Domains Section */}
                    <div className="px-2 py-1 text-[10px] uppercase font-semibold tracking-wider text-theme-text-muted/80">
                      {APP_CONTENT.marketplace.tabs.subCategoriesHeader}
                    </div>

                    {specializedCategoriesList.map((cat) => {
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
                          className={`h-8 w-full px-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors text-left ${
                            isCurrent
                              ? 'bg-theme-bg-elevated text-theme-brand-binance font-semibold'
                              : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/50'
                          }`}
                        >
                          <Icon
                            className={`size-3.5 shrink-0 ${
                              isCurrent
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
                  </>
                ) : (
                  /* When search query is typed: display filtered list */
                  filteredCategories.map((cat) => {
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
                        className={`h-8 w-full px-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors text-left ${
                          isCurrent
                            ? 'bg-theme-bg-elevated text-theme-brand-binance font-semibold'
                            : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/50'
                        }`}
                      >
                        <Icon
                          className={`size-3.5 shrink-0 ${
                            isCurrent
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
                  })
                )}

                {categorySearch && filteredCategories.length === 0 && (
                  <div className="py-4 px-2 text-center text-xs text-theme-text-muted">
                    {APP_CONTENT.marketplace.tabs.noMatch}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Sleek Sort Dropdown */}
        <div className="relative shrink-0" ref={sortRef}>
          <button
            type="button"
            onClick={() => {
              setIsSortOpen((prev) => !prev);
              setIsCategoryOpen(false);
            }}
            className={`h-7.5 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all border ${
              activeSort
                ? 'bg-theme-bg-elevated text-theme-brand-binance border-theme-brand-binance/35 font-semibold'
                : 'bg-theme-bg-elevated/40 text-theme-text-secondary hover:text-theme-text-primary border-theme-border-subtle'
            }`}
            aria-expanded={isSortOpen}
            aria-haspopup="listbox"
          >
            <SortTriggerIcon
              className={`size-3.5 shrink-0 ${
                activeSort ? 'text-theme-brand-binance' : 'text-theme-text-muted'
              }`}
            />
            <span className="text-theme-text-muted">
              {APP_CONTENT.marketplace.tabs.sortBy}:
            </span>
            <span className="truncate max-w-[110px]">{sortLabel}</span>
            <ChevronDown
              className={`size-3 text-theme-text-muted transition-transform duration-150 ${
                isSortOpen ? 'rotate-180' : ''
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
                    className={`h-8 w-full px-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors text-left ${
                      isCurrent
                        ? 'bg-theme-bg-elevated text-theme-brand-binance font-semibold'
                        : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/50'
                    }`}
                  >
                    <Icon
                      className={`size-3.5 shrink-0 ${
                        isCurrent
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

      {/* Row 2: Secondary Capability Tags */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-theme-border-subtle/40">
        <span className="text-3xs uppercase tracking-wider font-semibold text-theme-text-muted shrink-0 flex items-center gap-1 mr-1">
          <SlidersHorizontal className="size-3 text-theme-text-muted" />
          {APP_CONTENT.marketplace.tags.filterByCapability}:
        </span>

        {SECONDARY_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag.key);
          const TagIcon = TAG_ICON_MAP[tag.icon] ?? Zap;
          const label = APP_CONTENT.marketplace.tags[tag.key] || tag.label;

          return (
            <button
              key={tag.key}
              type="button"
              onClick={() => onToggleTag?.(tag.key)}
              className={`h-6 px-2 rounded-md text-3xs sm:text-2xs font-medium flex items-center gap-1 shrink-0 cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-theme-brand-binance/15 text-theme-brand-binance border-theme-brand-binance/40 font-semibold'
                  : 'bg-theme-bg-elevated/30 text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/60 border-theme-border-subtle'
              }`}
            >
              <TagIcon className="size-2.5 shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}

        {selectedTags.length > 0 && onClearTags && (
          <button
            type="button"
            onClick={onClearTags}
            className="h-6 px-2 rounded-md text-3xs text-theme-text-muted hover:text-theme-semantic-danger hover:bg-theme-semantic-danger/10 border border-transparent hover:border-theme-semantic-danger/20 shrink-0 cursor-pointer transition-colors flex items-center gap-1 ml-auto sm:ml-1"
          >
            <X className="size-2.5" />
            <span>{APP_CONTENT.marketplace.tags.clearAllTags}</span>
          </button>
        )}
      </div>
    </div>
  );
});