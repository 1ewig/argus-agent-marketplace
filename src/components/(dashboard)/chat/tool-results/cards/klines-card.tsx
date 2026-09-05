import React from 'react';
import { APP_CONTENT } from '@/constants/content';
import { formatUsd, formatPercent, MetricItem } from '../helpers';
import type { ToolCardProps } from '../types';

export function KlinesCard({ resultObj }: ToolCardProps) {
  const res = APP_CONTENT.process.results;
  const change = formatPercent(resultObj?.periodChangePercent);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
      <MetricItem
        label={res.timeframe}
        value={String(resultObj?.interval ?? '15m')}
        valueClassName="text-theme-brand-binance"
      />
      <MetricItem
        label={res.periodChange}
        value={change.text}
        valueClassName={
          change.isPositive
            ? 'text-theme-status-success'
            : change.isNegative
              ? 'text-theme-status-danger'
              : 'text-theme-text-primary'
        }
      />
      <MetricItem label={res.latestPrice} value={formatUsd(resultObj?.latestPrice)} />
      <MetricItem
        label={res.candlesCount}
        value={String(resultObj?.candleCount ?? '—')}
        valueClassName="text-theme-text-secondary"
      />
    </div>
  );
}
