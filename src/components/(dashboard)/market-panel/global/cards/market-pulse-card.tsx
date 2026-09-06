'use client';

import React from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { formatPrice } from '@/lib/utils';
import type { MarketPulse } from '@/lib/types';

export interface MarketPulseCardProps {
  pulse: MarketPulse;
}

export function MarketPulseCard({ pulse }: MarketPulseCardProps) {
  const content = APP_CONTENT.globalMarket.pulseCard;

  const isRiskOn = pulse.bias === 'Risk-On' || pulse.bias === 'Mildly Risk-On';
  const isRiskOff = pulse.bias === 'Risk-Off' || pulse.bias === 'Mildly Risk-Off';

  const biasBadgeClass = isRiskOn
    ? 'bg-theme-status-success/15 text-theme-status-success border-theme-status-success/30'
    : isRiskOff
    ? 'bg-theme-status-danger/15 text-theme-status-danger border-theme-status-danger/30'
    : 'bg-theme-text-muted/15 text-theme-text-secondary border-theme-border-subtle';

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs font-bold text-theme-text-primary tracking-wide uppercase">
            {content.title}
          </span>
        </div>

        <div className={`px-2 py-0.5 rounded-full border text-2xs font-bold font-mono tracking-tight uppercase ${biasBadgeClass}`}>
          {pulse.bias}
        </div>
      </div>

      {/* Hero Asset Grid: BTC, ETH, SOL, BNB */}
      <div className="grid grid-cols-2 gap-2">
        {pulse.assets.map((asset) => {
          const isPos = asset.changePercent >= 0;
          return (
            <div
              key={asset.symbol}
              className="flex flex-col gap-1 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/70"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-theme-text-primary font-mono">
                  {asset.baseAsset}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-2xs font-mono font-bold ${
                    isPos ? 'text-theme-status-success' : 'text-theme-status-danger'
                  }`}
                >
                  {isPos ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
                  {isPos ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%
                </span>
              </div>

              <span className="text-sm font-black font-mono text-theme-text-primary tracking-tight">
                ${formatPrice(asset.price)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Average 24h Move Indicator */}
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-theme-bg-elevated/25 border border-theme-border-subtle/50 text-2xs">
        <span className="font-semibold text-theme-text-muted">{content.avgChangeLabel}</span>
        <span
          className={`font-mono font-bold ${
            pulse.averageChange >= 0 ? 'text-theme-status-success' : 'text-theme-status-danger'
          }`}
        >
          {pulse.averageChange >= 0 ? '+' : ''}
          {pulse.averageChange.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
