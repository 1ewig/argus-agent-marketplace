'use client';

import React, { memo, useRef, useEffect } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="w-full bg-theme-bg-surface/95 backdrop-blur-md border-b border-theme-border-subtle shrink-0 z-20 px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
      {/* 1. Left: Mobile Toggle & Brand Meta */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label={APP_CONTENT.sidebar.openMobileSidebar}
          className="md:hidden size-9 rounded-xl flex items-center justify-center text-theme-text-secondary hover:text-theme-text-primary bg-theme-bg-elevated border border-theme-border-subtle cursor-pointer transition-colors shrink-0"
        >
          <Menu className="size-4.5" />
        </button>

        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-theme-brand-binance/10 text-theme-brand-binance border border-theme-brand-binance/25 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <span className="size-1.5 rounded-full bg-theme-status-success animate-pulse" />
              <Sparkles className="size-2.5 text-theme-brand-binance" />
              {APP_CONTENT.marketplace.header.badge}
            </span>

            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-theme-bg-elevated text-theme-text-secondary border border-theme-border-subtle flex items-center gap-1 shrink-0">
              <ShieldCheck className="size-3 text-theme-status-success" />
              {APP_CONTENT.marketplace.header.networkBadge}
            </span>

            <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-theme-bg-elevated/60 text-theme-text-muted border border-theme-border-subtle/60 hidden sm:inline-flex shrink-0">
              {APP_CONTENT.marketplace.header.liveFeedStatus}
            </span>
          </div>

          <div className="flex items-baseline gap-2.5">
            <h1 className="text-base sm:text-lg font-extrabold text-theme-text-primary tracking-tight truncate">
              {APP_CONTENT.marketplace.header.title}
            </h1>
            <span className="text-xs font-semibold text-theme-brand-binance/90 shrink-0">
              {APP_CONTENT.marketplace.header.totalRegistered(totalCount)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Right: Search & Actions */}
      <div className="flex items-center gap-2.5 flex-1 max-w-xl md:justify-end">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-text-muted">
            <Search className="size-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={APP_CONTENT.marketplace.header.searchPlaceholder}
            className="w-full h-9.5 pl-9 pr-14 bg-theme-bg-elevated/70 hover:bg-theme-bg-elevated focus:bg-theme-bg-elevated border border-theme-border-subtle focus:border-theme-brand-binance rounded-xl text-xs text-theme-text-primary placeholder:text-theme-text-muted outline-none transition-all shadow-2xs"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
            {searchQuery ? (
              <button
                type="button"
                onClick={onClearSearch}
                title={APP_CONTENT.marketplace.header.searchClear}
                className="size-6 rounded-md flex items-center justify-center text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-base/50 cursor-pointer transition-colors"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-3xs font-mono font-bold text-theme-text-muted bg-theme-bg-base/70 rounded border border-theme-border-subtle">
                /
              </kbd>
            )}
          </div>
        </div>

        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onRefresh}
          title={APP_CONTENT.marketplace.header.refreshTooltip}
          disabled={isFetching}
          className="size-9.5 rounded-xl flex items-center justify-center bg-theme-bg-elevated border border-theme-border-subtle hover:border-theme-border-strong text-theme-text-secondary hover:text-theme-text-primary cursor-pointer transition-all shrink-0 disabled:opacity-50 shadow-2xs"
        >
          <RotateCw
            className={`size-4 ${isFetching ? 'animate-spin text-theme-brand-binance' : ''}`}
          />
        </motion.button>
      </div>
    </header>
  );
});
