'use client';

import React, { memo } from 'react';
import {
  Layers,
  TrendingUp,
  Trophy,
  Flame,
  Clock,
  Coins,
  Grid,
  Activity,
  Radio,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { MarketplaceTab } from '@/hooks/agents/use-agent-marketplace';

export interface MarketplaceFilterBarProps {
  selectedTab: MarketplaceTab;
  onSelectTab: (tab: MarketplaceTab) => void;
}

interface FilterTabOption {
  id: MarketplaceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_TABS: FilterTabOption[] = [
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
    id: 'health_factor',
    label: APP_CONTENT.marketplace.tabs.health_factor,
    icon: Activity,
  },
  {
    id: 'monitoring',
    label: APP_CONTENT.marketplace.tabs.monitoring,
    icon: Radio,
  },
];

const CURATED_TABS: FilterTabOption[] = [
  {
    id: 'leaderboard',
    label: APP_CONTENT.marketplace.tabs.leaderboard,
    icon: Trophy,
  },
  {
    id: 'trending',
    label: APP_CONTENT.marketplace.tabs.trending,
    icon: Flame,
  },
  {
    id: 'featured',
    label: APP_CONTENT.marketplace.tabs.featured,
    icon: TrendingUp,
  },
  {
    id: 'latest',
    label: APP_CONTENT.marketplace.tabs.latest,
    icon: Clock,
  },
];

export const MarketplaceFilterBar = memo(function MarketplaceFilterBar({
  selectedTab,
  onSelectTab,
}: MarketplaceFilterBarProps) {
  return (
    <div className="w-full bg-theme-bg-surface/80 border-b border-theme-border-subtle px-4 sm:px-6 py-2 flex flex-col gap-2">
      {/* 1. Primary Track & Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted shrink-0 mr-1 hidden sm:inline">
          {APP_CONTENT.marketplace.tabs.categoriesTitle}:
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all select-none shrink-0 ${
                  isActive
                    ? 'bg-theme-bg-elevated text-theme-brand-binance border border-theme-brand-binance/40 shadow-2xs font-bold'
                    : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40 border border-theme-border-subtle/50'
                }`}
              >
                <Icon
                  className={`size-3.5 shrink-0 ${
                    isActive ? 'text-theme-brand-binance' : 'text-theme-text-muted'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-theme-border-subtle shrink-0 mx-1" />

        {/* 2. Curated Feeds & Discovery Modes */}
        <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted shrink-0 mr-1 hidden lg:inline">
          {APP_CONTENT.marketplace.tabs.feedsTitle}:
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {CURATED_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all select-none shrink-0 ${
                  isActive
                    ? 'bg-theme-bg-elevated text-theme-brand-binance border border-theme-brand-binance/40 shadow-2xs font-bold'
                    : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40 border border-theme-border-subtle/50'
                }`}
              >
                <Icon
                  className={`size-3.5 shrink-0 ${
                    isActive ? 'text-theme-brand-binance' : 'text-theme-text-muted'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
