'use client';

import React, { memo, useRef, useEffect } from 'react';
import { Search, X, RotateCw, Menu } from 'lucide-react';
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

      {/* 2. Right: Minimalist Search & Refresh */}
      <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-theme-text-muted">
            <Search className="size-3.5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={APP_CONTENT.marketplace.header.searchPlaceholder}
            className="w-full h-8 pl-8 pr-8 bg-theme-bg-elevated/50 hover:bg-theme-bg-elevated focus:bg-theme-bg-elevated border border-theme-border-subtle focus:border-theme-brand-binance/60 rounded-lg text-xs text-theme-text-primary placeholder:text-theme-text-muted outline-none transition-all"
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
