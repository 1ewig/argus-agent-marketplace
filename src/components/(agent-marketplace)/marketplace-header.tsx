'use client';

import React, { memo, useState, useCallback } from 'react';
import { RotateCw, Menu, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';

export interface MarketplaceHeaderProps {
  onRefresh: () => void;
  onToggleMobileSidebar: () => void;
  totalCount: number;
  isFetching: boolean;
  isHiredPanelOpen?: boolean;
  onToggleHiredPanel?: () => void;
  hiredCount?: number;
}

export const MarketplaceHeader = memo(function MarketplaceHeader({
  onRefresh,
  onToggleMobileSidebar,
  totalCount,
  isFetching,
  isHiredPanelOpen,
  onToggleHiredPanel,
  hiredCount = 0,
}: MarketplaceHeaderProps) {
  const [isPending, setIsPending] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isFetching || isPending) return;
    setIsPending(true);
    try {
      await onRefresh();
    } finally {
      // Ensure tactile loading feedback is visible for at least 500ms
      setTimeout(() => {
        setIsPending(false);
      }, 500);
    }
  }, [isFetching, isPending, onRefresh]);

  const isLoadingState = isFetching || isPending;

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

      {/* 2. Right: Refresh Action & Hired Agents Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {onToggleHiredPanel && (
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={onToggleHiredPanel}
            title={
              isHiredPanelOpen
                ? APP_CONTENT.hiredAgents.panel.collapseTooltip
                : APP_CONTENT.hiredAgents.panel.expandTooltip
            }
            className={`h-8 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer select-none ${
              isHiredPanelOpen
                ? 'bg-theme-brand-binance text-theme-bg-overlay border-theme-brand-binance shadow-2xs'
                : 'bg-theme-bg-elevated/60 border-theme-border-subtle hover:border-theme-brand-binance/50 hover:bg-theme-bg-elevated text-theme-text-secondary hover:text-theme-text-primary'
            }`}
          >
            <Bot className="size-3.5" />
            <span className="hidden sm:inline">{APP_CONTENT.hiredAgents.panel.title}</span>
            {hiredCount > 0 && (
              <span
                className={`text-3xs font-extrabold px-1.5 py-0.2 rounded-full font-mono ${
                  isHiredPanelOpen
                    ? 'bg-theme-bg-overlay text-theme-brand-binance'
                    : 'bg-theme-brand-binance/20 text-theme-brand-binance'
                }`}
              >
                {hiredCount}
              </span>
            )}
          </motion.button>
        )}

        <motion.button
          type="button"
          whileTap={isLoadingState ? undefined : tapScalePill}
          onClick={handleRefresh}
          title={APP_CONTENT.marketplace.header.refreshTooltip}
          disabled={isLoadingState}
          className={`h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold border transition-all select-none ${
            isLoadingState
              ? 'bg-theme-bg-elevated/40 border-theme-border-subtle text-theme-text-muted cursor-not-allowed'
              : 'bg-theme-bg-elevated/60 border-theme-border-subtle hover:border-theme-brand-binance/50 hover:bg-theme-bg-elevated text-theme-text-secondary hover:text-theme-text-primary cursor-pointer shadow-2xs'
          }`}
        >
          <RotateCw
            className={`size-3.5 ${
              isLoadingState ? 'animate-spin text-theme-brand-binance' : 'text-theme-text-muted'
            }`}
          />
          <span>
            {isLoadingState
              ? APP_CONTENT.marketplace.header.refreshingAction
              : APP_CONTENT.marketplace.header.refreshAction}
          </span>
        </motion.button>
      </div>
    </header>
  );
});
