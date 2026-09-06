import React from 'react';
import { Layers } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { MarketIntelligencePayload } from '@/agent';

export interface MarketLevelsCardProps {
  levels: MarketIntelligencePayload['levels'];
}

export function MarketLevelsCard({ levels }: MarketLevelsCardProps) {
  const content = APP_CONTENT.marketIntelligence.levelsCard;

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs font-bold text-theme-text-primary tracking-wide uppercase">
            {content.title}
          </span>
        </div>
      </div>

      {/* Levels Grid (Support & Resistance) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Support */}
        <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-status-success/20">
          <span className="text-[10px] font-mono font-semibold uppercase text-theme-status-success">
            {content.supportLabel}
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-theme-text-primary tracking-tight">
            ${levels.support.toLocaleString('en-US')}
          </span>
        </div>

        {/* Resistance */}
        <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-status-danger/20">
          <span className="text-[10px] font-mono font-semibold uppercase text-theme-status-danger">
            {content.resistanceLabel}
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-theme-text-primary tracking-tight">
            ${levels.resistance.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* Bias Pill & Summary */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-theme-border-subtle/50 text-xs">
        <span className="text-theme-text-secondary leading-relaxed">
          {levels.summary}
        </span>
        <span
          className={`px-2 py-0.5 rounded text-2xs font-mono font-bold shrink-0 ${
            levels.bias === 'bullish'
              ? 'bg-theme-status-success/15 text-theme-status-success border border-theme-status-success/30'
              : levels.bias === 'bearish'
              ? 'bg-theme-status-danger/15 text-theme-status-danger border border-theme-status-danger/30'
              : 'bg-theme-bg-elevated text-theme-text-secondary border border-theme-border-subtle'
          }`}
        >
          {content.biasPrefix}{' '}
          {levels.bias === 'bullish'
            ? content.biasBullish
            : levels.bias === 'bearish'
            ? content.biasBearish
            : content.biasNeutral}
        </span>
      </div>
    </div>
  );
}
