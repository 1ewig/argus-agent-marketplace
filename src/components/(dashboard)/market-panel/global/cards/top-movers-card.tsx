'use client';

import React from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { formatPrice } from '@/lib/utils';
import type { TopMovers } from '@/lib/types';

export interface TopMoversCardProps {
  movers: TopMovers;
}

export function TopMoversCard({ movers }: TopMoversCardProps) {
  const content = APP_CONTENT.globalMarket.topMoversCard;

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs font-bold text-theme-text-primary tracking-wide uppercase">
            {content.title}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Gainers Column */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-theme-status-success uppercase tracking-wider">
            <TrendingUp className="size-3" />
            <span>{content.gainersLabel}</span>
          </div>

          <div className="flex flex-col gap-1">
            {movers.gainers.length > 0 ? (
              movers.gainers.map((item) => (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between p-2 rounded-lg bg-theme-bg-elevated/35 border border-theme-border-subtle/60"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-theme-text-primary font-mono leading-tight">
                      {item.baseAsset}
                    </span>
                    <span className="text-[10px] font-mono text-theme-text-muted">
                      ${formatPrice(item.price)}
                    </span>
                  </div>

                  <span className="px-1.5 py-0.5 rounded bg-theme-status-success/15 border border-theme-status-success/25 text-2xs font-mono font-bold text-theme-status-success">
                    +{item.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))
            ) : (
              <span className="text-2xs text-theme-text-muted py-2 text-center">
                {content.noGainers}
              </span>
            )}
          </div>
        </div>

        {/* Losers Column */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-theme-status-danger uppercase tracking-wider">
            <TrendingDown className="size-3" />
            <span>{content.losersLabel}</span>
          </div>

          <div className="flex flex-col gap-1">
            {movers.losers.length > 0 ? (
              movers.losers.map((item) => (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between p-2 rounded-lg bg-theme-bg-elevated/35 border border-theme-border-subtle/60"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-theme-text-primary font-mono leading-tight">
                      {item.baseAsset}
                    </span>
                    <span className="text-[10px] font-mono text-theme-text-muted">
                      ${formatPrice(item.price)}
                    </span>
                  </div>

                  <span className="px-1.5 py-0.5 rounded bg-theme-status-danger/15 border border-theme-status-danger/25 text-2xs font-mono font-bold text-theme-status-danger">
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))
            ) : (
              <span className="text-2xs text-theme-text-muted py-2 text-center">
                {content.noLosers}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
