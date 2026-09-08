'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Layers,
  Coins,
  Grid,
  Activity,
  Radio,
  Trophy,
  Flame,
  Sparkles,
  Clock,
  RefreshCw,
  ShieldCheck,
  Zap,
  Bot,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { MarketplaceTab } from '@/hooks/agents/use-agent-marketplace';

export interface MarketplaceFilterBarProps {
  selectedTab: MarketplaceTab;
  onSelectTab: (tab: MarketplaceTab) => void;
}

interface CategoryOption {
  id: MarketplaceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SortOption {
  id: MarketplaceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: APP_CONTENT.marketplace.tabs.all, icon: Layers },
  {
    id: 'yield_optimisation',
    label: APP_CONTENT.marketplace.tabs.yield_optimisation,
    icon: Coins,
  },
  {
    id: 'grid_trading',
    label: APP_CONTENT.marketplace.tabs.grid_trading,
    icon: Grid,
  },
  {
    id: 'rebalancing',
    label: APP_CONTENT.marketplace.tabs.rebalancing,
    icon: RefreshCw,
  },
  {
    id: 'health_factor',
    label: APP_CONTENT.marketplace.tabs.health_factor,
    icon: Activity,
  },
  {
    id: 'monitoring',
    label: APP_CONTENT.marketplace.tabs.monitoring,
    icon: Radio,
  },
  {
    id: 'security',
    label: APP_CONTENT.marketplace.tabs.security,
    icon: ShieldCheck,
  },
  {
    id: 'payments',
    label: APP_CONTENT.marketplace.tabs.payments,
    icon: Zap,
  },
  {
    id: 'cross_agent',
    label: APP_CONTENT.marketplace.tabs.cross_agent,
    icon: Bot,
  },
];

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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine active sort label if a curated sort option is selected
  const activeSort = SORT_OPTIONS.find((s) => s.id === selectedTab);
  const sortLabel = activeSort?.label ?? APP_CONTENT.marketplace.tabs.leaderboard;

  return (
    <div className="w-full bg-theme-bg-surface/50 border-b border-theme-border-subtle/80 px-4 sm:px-6 h-11 flex items-center justify-between gap-3">
      {/* 1. Track Categories Segmented Pills */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedTab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectTab(cat.id)}
              className={`h-7.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all select-none ${
                isActive
                  ? 'bg-theme-bg-elevated text-theme-brand-binance border border-theme-brand-binance/35 shadow-2xs font-bold'
                  : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40 border border-transparent'
              }`}
            >
              <Icon
                className={`size-3 shrink-0 ${
                  isActive ? 'text-theme-brand-binance' : 'text-theme-text-muted'
                }`}
              />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Sleek Sort Dropdown */}
      <div className="relative shrink-0" ref={sortRef}>
        <button
          type="button"
          onClick={() => setIsSortOpen((prev) => !prev)}
          className={`h-7.5 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all border ${
            activeSort
              ? 'bg-theme-bg-elevated text-theme-brand-binance border-theme-brand-binance/35 font-semibold'
              : 'bg-theme-bg-elevated/40 text-theme-text-secondary hover:text-theme-text-primary border-theme-border-subtle'
          }`}
        >
          <span className="text-theme-text-muted">{APP_CONTENT.marketplace.tabs.sortBy}:</span>
          <span>{sortLabel}</span>
          <ChevronDown className="size-3 text-theme-text-muted ml-0.5" />
        </button>

        {isSortOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-40 bg-theme-bg-surface border border-theme-border-subtle rounded-xl shadow-xl p-1 z-30 flex flex-col gap-0.5">
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
                  className={`h-8 w-full px-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors text-left ${
                    isCurrent
                      ? 'bg-theme-bg-elevated text-theme-brand-binance font-bold'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/50'
                  }`}
                >
                  <Icon
                    className={`size-3.5 ${
                      isCurrent ? 'text-theme-brand-binance' : 'text-theme-text-muted'
                    }`}
                  />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
