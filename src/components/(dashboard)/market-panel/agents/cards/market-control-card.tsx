import React from 'react';
import { Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { MarketIntelligencePayload } from '@/agent';

export interface MarketControlCardProps {
  control: MarketIntelligencePayload['control'];
}

export function MarketControlCard({ control }: MarketControlCardProps) {
  const content = APP_CONTENT.marketIntelligence.controlCard;

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Scale className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs font-bold text-theme-text-primary tracking-wide uppercase">
            {content.title}
          </span>
        </div>
      </div>

      {/* Hero Control Stance */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
        <div className="flex items-center gap-2">
          {control.side === 'buyers' ? (
            <div className="size-6 rounded-full bg-theme-status-success/15 text-theme-status-success flex items-center justify-center shrink-0">
              <TrendingUp className="size-3.5" />
            </div>
          ) : control.side === 'sellers' ? (
            <div className="size-6 rounded-full bg-theme-status-danger/15 text-theme-status-danger flex items-center justify-center shrink-0">
              <TrendingDown className="size-3.5" />
            </div>
          ) : (
            <div className="size-6 rounded-full bg-theme-text-muted/15 text-theme-text-muted flex items-center justify-center shrink-0">
              <Minus className="size-3.5" />
            </div>
          )}
          <span className="text-xs sm:text-sm font-bold text-theme-text-primary">
            {control.side === 'buyers'
              ? content.buyersLabel
              : control.side === 'sellers'
              ? content.sellersLabel
              : content.neutralLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle font-mono text-2xs font-bold text-theme-brand-binance">
          <span>{content.imbalanceLabel}</span>
          <span>{control.imbalance}x</span>
        </div>
      </div>

      {/* Summary Takeaway */}
      <p className="text-xs text-theme-text-secondary leading-relaxed pt-0.5">
        {control.summary}
      </p>
    </div>
  );
}
