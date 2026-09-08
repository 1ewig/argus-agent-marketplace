'use client';

import React, { memo } from 'react';
import { Search, X, RotateCw, Menu, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';

export interface MarketplaceHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onRefresh: () => void;
  onToggleMobileSidebar: () => void;
  totalCount: number;
  isFetching: boolean;
}

export const MarketplaceHeader = memo(function MarketplaceHeader({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onRefresh,
  onToggleMobileSidebar,
  totalCount,
  isFetching,
}: MarketplaceHeaderProps) {
  return (
    <header className="w-full bg-theme-bg-surface/90 backdrop-blur-md border-b border-theme-border-subtle shrink-0 z-20 px-4 md:px-6 py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* 1. Left: Mobile Toggle & Brand Meta */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label={APP_CONTENT.sidebar.openMobileSidebar}
          className="md:hidden size-9 rounded-lg flex items-center justify-center text-theme-text-secondary hover:text-theme-text-primary bg-theme-bg-elevated border border-theme-border-subtle cursor-pointer transition-colors shrink-0"
        >
          <Menu className="size-4.5" />
        </button>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-theme-brand-binance/10 text-theme-brand-binance border border-theme-brand-binance/20 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3 text-theme-brand-binance" />
              {APP_CONTENT.marketplace.header.badge}
            </span>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-theme-bg-elevated text-theme-text-secondary border border-theme-border-subtle flex items-center gap-1">
              <ShieldCheck className="size-3 text-theme-status-success" />
              {APP_CONTENT.marketplace.header.networkBadge}
            </span>
          </div>

          <div className="flex items-baseline gap-2.5 mt-0.5">
            <h1 className="text-base md:text-lg font-bold text-theme-text-primary tracking-tight">
              {APP_CONTENT.marketplace.header.title}
            </h1>
            <span className="text-xs font-medium text-theme-text-muted hidden sm:inline">
              {APP_CONTENT.marketplace.header.totalRegistered(totalCount)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Right: Instant Search & Actions */}
      <div className="flex items-center gap-2.5 flex-1 max-w-xl md:justify-end">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-text-muted">
            <Search className="size-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={APP_CONTENT.marketplace.header.searchPlaceholder}
            className="w-full h-9.5 pl-9 pr-8 bg-theme-bg-elevated/70 hover:bg-theme-bg-elevated focus:bg-theme-bg-elevated border border-theme-border-subtle focus:border-theme-brand-binance rounded-xl text-xs text-theme-text-primary placeholder:text-theme-text-muted outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              title={APP_CONTENT.marketplace.header.searchClear}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-theme-text-muted hover:text-theme-text-primary cursor-pointer transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Refresh Button */}
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onRefresh}
          title={APP_CONTENT.marketplace.header.refreshTooltip}
          disabled={isFetching}
          className="size-9.5 rounded-xl flex items-center justify-center bg-theme-bg-elevated border border-theme-border-subtle hover:border-theme-border-strong text-theme-text-secondary hover:text-theme-text-primary cursor-pointer transition-colors shrink-0 disabled:opacity-50"
        >
          <RotateCw
            className={`size-4 ${isFetching ? 'animate-spin text-theme-brand-binance' : ''}`}
          />
        </motion.button>
      </div>
    </header>
  );
});
