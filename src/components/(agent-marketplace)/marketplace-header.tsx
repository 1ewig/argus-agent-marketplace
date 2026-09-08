'use client';

import React, { memo } from 'react';
import { RotateCw, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';

export interface MarketplaceHeaderProps {
  onRefresh: () => void;
  onToggleMobileSidebar: () => void;
  totalCount: number;
  isFetching: boolean;
}

export const MarketplaceHeader = memo(function MarketplaceHeader({
  onRefresh,
  onToggleMobileSidebar,
  totalCount,
  isFetching,
}: MarketplaceHeaderProps) {
  return (
    <header className="w-full bg-theme-bg-surface/90 backdrop-blur-md border-b border-theme-border-subtle shrink-0 z-20 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
      {/* 1. Left: Brand Title & Minimal Live Count */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label={APP_CONTENT.sidebar.openMobileSidebar}
          className="md:hidden size-8 rounded-lg flex items-center justify-center text-theme-text-secondary hover:text-theme-text-primary bg-theme-bg-elevated border border-theme-border-subtle cursor-pointer transition-colors shrink-0"
        >
          <Menu className="size-4" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-theme-status-success animate-pulse shrink-0" />
            <h1 className="text-sm sm:text-base font-bold text-theme-text-primary tracking-tight whitespace-nowrap">
              {APP_CONTENT.marketplace.header.title}
            </h1>
          </div>

          <span className="text-theme-border-subtle hidden sm:inline">•</span>

          <span className="text-2xs font-medium text-theme-text-secondary hidden sm:inline truncate">
            {APP_CONTENT.marketplace.header.subtitle(totalCount)}
          </span>
        </div>
      </div>

      {/* 2. Right: Refresh Action */}
      <div className="flex items-center gap-2 shrink-0">
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onRefresh}
          title={APP_CONTENT.marketplace.header.refreshTooltip}
          disabled={isFetching}
          className="size-8 rounded-lg flex items-center justify-center bg-theme-bg-elevated/60 border border-theme-border-subtle hover:border-theme-border-strong text-theme-text-secondary hover:text-theme-text-primary cursor-pointer transition-all shrink-0 disabled:opacity-40"
        >
          <RotateCw
            className={`size-3.5 ${isFetching ? 'animate-spin text-theme-brand-binance' : ''}`}
          />
        </motion.button>
      </div>
    </header>
  );
});
