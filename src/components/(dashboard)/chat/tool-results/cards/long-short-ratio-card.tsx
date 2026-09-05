import React from 'react';
import { APP_CONTENT } from '@/constants/content';
import { MetricItem } from '../helpers';
import type { ToolCardProps } from '../types';

export function LongShortRatioCard({ resultObj }: ToolCardProps) {
  const res = APP_CONTENT.process.results;
  const summary = (resultObj?.summary as Record<string, unknown>) ?? {};
  const symbol = typeof resultObj?.symbol === 'string' ? (resultObj.symbol as string) : undefined;
  const period = typeof resultObj?.period === 'string' ? (resultObj.period as string) : '5m';

  const longPercent = Number(summary?.longPercent ?? 50);
  const shortPercent = Number(summary?.shortPercent ?? 50);
  const ratio = Number(summary?.longShortRatio ?? 1.0);
  const sentiment = String(summary?.sentiment ?? 'neutral');

  const isBullish = sentiment === 'bullish';
  const isBearish = sentiment === 'bearish';

  const sentimentLabel = isBullish
    ? res.bullishBias
    : isBearish
      ? res.bearishBias
      : res.neutralBias;

  const sentimentColorClass = isBullish
    ? 'bg-theme-status-success/15 text-theme-status-success border-theme-status-success/30'
    : isBearish
      ? 'bg-theme-status-danger/15 text-theme-status-danger border-theme-status-danger/30'
      : 'bg-theme-bg-elevated text-theme-text-muted border-theme-border-subtle';

  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
      {/* Top Stat Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 border-b border-theme-border-subtle/50">
        <MetricItem
          label={res.longShortRatio}
          value={`${ratio.toFixed(2)}x`}
          valueClassName={
            isBullish
              ? 'text-theme-status-success'
              : isBearish
                ? 'text-theme-status-danger'
                : 'text-theme-text-primary'
          }
        />
        <MetricItem
          label={res.longAccountRatio}
          value={`${longPercent.toFixed(1)}%`}
          valueClassName="text-theme-status-success"
        />
        <MetricItem
          label={res.shortAccountRatio}
          value={`${shortPercent.toFixed(1)}%`}
          valueClassName="text-theme-status-danger"
        />
        <div className="flex flex-col justify-center">
          <span className="text-[10px] text-theme-text-muted font-normal uppercase tracking-wider mb-0.5">
            {res.period}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-theme-brand-binance">{period}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${sentimentColorClass}`}
            >
              {sentimentLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Proportional Long/Short Distribution Bar */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-theme-text-muted">
        <span className="text-theme-status-success font-semibold">{longPercent.toFixed(1)}% L</span>
        <div className="flex-1 h-1.5 rounded-full bg-theme-bg-surface overflow-hidden flex">
          <div
            className="h-full bg-theme-status-success/70 transition-all duration-300"
            style={{ width: `${longPercent}%` }}
          />
          <div
            className="h-full bg-theme-status-danger/70 transition-all duration-300"
            style={{ width: `${shortPercent}%` }}
          />
        </div>
        <span className="text-theme-status-danger font-semibold">{shortPercent.toFixed(1)}% S</span>
      </div>

      {symbol && (
        <div className="flex justify-between items-center text-[10px] font-mono text-theme-text-muted pt-0.5">
          <span>{symbol} Perpetual</span>
          <span className="capitalize">{sentiment} Market Bias</span>
        </div>
      )}
    </div>
  );
}
