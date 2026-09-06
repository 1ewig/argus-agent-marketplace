import React from 'react';
import { Gauge } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { MarketIntelligencePayload } from '@/agent';

export interface MarketPositioningCardProps {
  positioning: MarketIntelligencePayload['positioning'];
}

export function MarketPositioningCard({ positioning }: MarketPositioningCardProps) {
  const content = APP_CONTENT.marketIntelligence.positioningCard;

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Gauge className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs font-bold text-theme-text-primary tracking-wide uppercase">
            {content.title}
          </span>
        </div>
      </div>

      {/* Stance Indicators */}
      <div className="grid grid-cols-2 gap-2">
        {/* Funding Bias */}
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
          <span className="text-[10px] font-mono font-semibold uppercase text-theme-text-muted">
            Funding
          </span>
          <span className="text-xs font-bold font-mono text-theme-text-primary">
            {positioning.fundingBias === 'longs_paying'
              ? content.fundingLongs
              : positioning.fundingBias === 'shorts_paying'
              ? content.fundingShorts
              : content.fundingNeutral}
          </span>
        </div>

        {/* Sentiment */}
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
          <span className="text-[10px] font-mono font-semibold uppercase text-theme-text-muted">
            Sentiment
          </span>
          <span
            className={`text-xs font-bold font-mono ${
              positioning.sentiment.includes('bullish')
                ? 'text-theme-status-success'
                : positioning.sentiment.includes('bearish')
                ? 'text-theme-status-danger'
                : 'text-theme-text-secondary'
            }`}
          >
            {positioning.sentiment === 'mildly_bullish'
              ? content.sentimentMildlyBullish
              : positioning.sentiment === 'bullish'
              ? content.sentimentBullish
              : positioning.sentiment === 'mildly_bearish'
              ? content.sentimentMildlyBearish
              : positioning.sentiment === 'bearish'
              ? content.sentimentBearish
              : content.sentimentNeutral}
          </span>
        </div>
      </div>

      {/* Positioning Summary */}
      <p className="text-xs text-theme-text-secondary leading-relaxed pt-0.5">
        {positioning.summary}
      </p>
    </div>
  );
}
