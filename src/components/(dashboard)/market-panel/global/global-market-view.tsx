'use client';

import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import { motion } from 'framer-motion';
import type { GlobalMarketOverviewData } from '@/lib/types';
import {
  MarketPulseCard,
  TopMoversCard,
  FundingHeatmapCard,
  GlobalPositioningCard,
} from './cards';

export interface GlobalMarketViewProps {
  data?: GlobalMarketOverviewData;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function GlobalMarketView({
  data,
  isLoading,
  isError,
  onRetry,
}: GlobalMarketViewProps) {
  const content = APP_CONTENT.globalMarket;

  // 1. Loading State Skeleton
  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-3.5 sm:gap-4 animate-pulse">
        {/* Skeleton Card 1 */}
        <div className="h-44 rounded-xl bg-theme-bg-elevated/40 border border-theme-border-subtle/80 flex flex-col p-4 justify-between">
          <div className="h-4 w-28 bg-theme-bg-surface rounded" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-14 bg-theme-bg-surface rounded-lg" />
            <div className="h-14 bg-theme-bg-surface rounded-lg" />
            <div className="h-14 bg-theme-bg-surface rounded-lg" />
            <div className="h-14 bg-theme-bg-surface rounded-lg" />
          </div>
          <div className="h-4 w-full bg-theme-bg-surface rounded" />
        </div>

        {/* Skeleton Card 2 */}
        <div className="h-36 rounded-xl bg-theme-bg-elevated/40 border border-theme-border-subtle/80 flex flex-col p-4 justify-between">
          <div className="h-4 w-24 bg-theme-bg-surface rounded" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 bg-theme-bg-surface rounded-lg" />
            <div className="h-16 bg-theme-bg-surface rounded-lg" />
          </div>
        </div>

        {/* Skeleton Card 3 */}
        <div className="h-44 rounded-xl bg-theme-bg-elevated/40 border border-theme-border-subtle/80 flex flex-col p-4 justify-between">
          <div className="h-4 w-32 bg-theme-bg-surface rounded" />
          <div className="space-y-1.5">
            <div className="h-7 bg-theme-bg-surface rounded" />
            <div className="h-7 bg-theme-bg-surface rounded" />
            <div className="h-7 bg-theme-bg-surface rounded" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-theme-text-muted font-mono py-2">
          <Loader2 className="size-3.5 animate-spin text-theme-brand-binance" />
          <span>{content.loading}</span>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (isError && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl bg-theme-status-danger/5 border border-theme-status-danger/20 my-auto">
        <AlertCircle className="size-8 text-theme-status-danger mb-2" />
        <p className="text-xs text-theme-text-secondary mb-3 max-w-xs leading-relaxed">
          {content.errorMessage}
        </p>
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-theme-bg-elevated hover:bg-theme-bg-surface border border-theme-border-subtle text-theme-text-primary transition-colors cursor-pointer shadow-2xs"
        >
          <RefreshCw className="size-3 text-theme-brand-binance" />
          <span>{content.retryButton}</span>
        </motion.button>
      </div>
    );
  }

  if (!data) return null;

  // 3. Rendered 4-Card Global Market View
  return (
    <div className="flex flex-col gap-3.5 sm:gap-4">
      {/* Card 1: Market Pulse */}
      <MarketPulseCard pulse={data.marketPulse} />

      {/* Card 2: Top Movers */}
      <TopMoversCard movers={data.topMovers} />

      {/* Card 3: Funding Heatmap */}
      <FundingHeatmapCard funding={data.funding} />

      {/* Card 4: Macro Positioning */}
      <GlobalPositioningCard positioning={data.positioning} />

      {/* Verified Live Feed Footer */}
      <div className="text-[10px] font-mono text-center text-theme-text-muted/70 py-1 select-none">
        {APP_CONTENT.marketPanel.mockupNotice}
      </div>
    </div>
  );
}
