'use client';

import React from 'react';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { GlobalPositioning } from '@/lib/types';

export interface GlobalPositioningCardProps {
  positioning: GlobalPositioning;
}

export function GlobalPositioningCard({ positioning }: GlobalPositioningCardProps) {
  const content = APP_CONTENT.globalMarket.positioningCard;

  const getBiasBadge = (bias: 'Long-biased' | 'Short-biased' | 'Neutral') => {
    if (bias === 'Long-biased') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-theme-status-success/15 border border-theme-status-success/25 text-2xs font-mono font-bold text-theme-status-success">
          <TrendingUp className="size-2.5" />
          {content.longBiased}
        </span>
      );
    }
    if (bias === 'Short-biased') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-theme-status-danger/15 border border-theme-status-danger/25 text-2xs font-mono font-bold text-theme-status-danger">
          <TrendingDown className="size-2.5" />
          {content.shortBiased}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-theme-text-muted/15 border border-theme-border-subtle text-2xs font-mono font-bold text-theme-text-secondary">
        <Minus className="size-2.5" />
        {content.neutral}
      </span>
    );
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs font-bold text-theme-text-primary tracking-wide uppercase">
            {content.title}
          </span>
        </div>
      </div>

      {/* Grid: Retail vs Whale */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Retail Tile */}
        <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/70">
          <span className="text-[10px] font-mono font-semibold text-theme-text-muted uppercase">
            {content.retailLabel}
          </span>

          <div className="flex items-baseline justify-between gap-1">
            <span className="text-sm font-black font-mono text-theme-text-primary">
              {positioning.retailRatio}
            </span>
            {getBiasBadge(positioning.retailBias)}
          </div>
        </div>

        {/* Whale Tile */}
        <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/70">
          <span className="text-[10px] font-mono font-semibold text-theme-text-muted uppercase">
            {content.whalesLabel}
          </span>

          <div className="flex items-baseline justify-between gap-1">
            <span className="text-sm font-black font-mono text-theme-text-primary">
              {positioning.whaleRatio}
            </span>
            {getBiasBadge(positioning.whaleBias)}
          </div>
        </div>
      </div>

      {/* Positioning Summary */}
      <div className="p-2.5 rounded-lg bg-theme-bg-elevated/25 border border-theme-border-subtle/50 text-xs text-theme-text-secondary leading-relaxed">
        {positioning.summary}
      </div>
    </div>
  );
}
