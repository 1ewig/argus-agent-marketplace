'use client';

import React from 'react';
import { Gauge } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { FundingHeatmapItem } from '@/lib/types';

export interface FundingHeatmapCardProps {
  funding: FundingHeatmapItem[];
}

export function FundingHeatmapCard({ funding }: FundingHeatmapCardProps) {
  const content = APP_CONTENT.globalMarket.fundingCard;

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Gauge className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs font-bold text-theme-text-primary tracking-wide uppercase">
            {content.title}
          </span>
        </div>

        <span className="text-[10px] font-mono text-theme-text-muted">
          {content.subtitle}
        </span>
      </div>

      {/* Funding Rows */}
      <div className="flex flex-col gap-1.5">
        {funding.map((item) => {
          const isPos = item.rate > 0.00002;
          const isNeg = item.rate < -0.00002;

          return (
            <div
              key={item.symbol}
              className="flex items-center justify-between p-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/70"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-theme-text-primary font-mono w-10">
                  {item.baseAsset}
                </span>

                <span
                  className={`text-xs font-mono font-bold ${
                    isPos
                      ? 'text-theme-status-success'
                      : isNeg
                      ? 'text-theme-status-danger'
                      : 'text-theme-text-secondary'
                  }`}
                >
                  {isPos ? '+' : ''}
                  {item.ratePercent.toFixed(4)}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-theme-text-muted">
                  {item.apr.toFixed(2)}% {content.aprHeader}
                </span>

                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    isPos
                      ? 'bg-theme-status-success/10 text-theme-status-success border-theme-status-success/20'
                      : isNeg
                      ? 'bg-theme-status-danger/10 text-theme-status-danger border-theme-status-danger/20'
                      : 'bg-theme-text-muted/10 text-theme-text-muted border-theme-border-subtle'
                  }`}
                >
                  {isPos ? content.longsPaying : isNeg ? content.shortsPaying : content.neutral}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
