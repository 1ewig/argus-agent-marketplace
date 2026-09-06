import React from 'react';
import { Crosshair } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { MarketIntelligencePayload } from '@/agent';

export interface MarketPlaybookCardProps {
  playbook: MarketIntelligencePayload['playbook'];
}

export function MarketPlaybookCard({ playbook }: MarketPlaybookCardProps) {
  const content = APP_CONTENT.marketIntelligence.playbookCard;

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Crosshair className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs font-bold text-theme-text-primary tracking-wide uppercase">
            {content.title}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-theme-brand-binance/10 text-theme-brand-binance border border-theme-brand-binance/25">
          {playbook.bias === 'dip_buyer'
            ? content.biases.dip_buyer
            : playbook.bias === 'breakout'
            ? content.biases.breakout
            : playbook.bias === 'range_scalp'
            ? content.biases.range_scalp
            : content.biases.risk_off}
        </span>
      </div>

      {/* Target vs Invalidation Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Target */}
        <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle">
          <span className="text-[10px] font-mono font-semibold uppercase text-theme-status-success">
            {content.targetLabel}
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-theme-text-primary tracking-tight">
            ${playbook.target.toLocaleString('en-US')}
          </span>
        </div>

        {/* Invalidation */}
        <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle">
          <span className="text-[10px] font-mono font-semibold uppercase text-theme-status-danger">
            {content.invalidationLabel}
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-theme-text-primary tracking-tight">
            ${playbook.invalidation.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* Playbook Summary */}
      <p className="text-xs text-theme-text-secondary leading-relaxed pt-0.5">
        {playbook.summary}
      </p>
    </div>
  );
}
