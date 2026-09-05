import React from 'react';
import { APP_CONTENT } from '@/constants/content';
import { formatUsd, formatPercent, MetricItem } from '../helpers';
import type { ToolCardProps } from '../types';

export function Stats24hCard({ resultObj }: ToolCardProps) {
  const res = APP_CONTENT.process.results;
  const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
  const change = formatPercent(data?.priceChangePercent);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
      <MetricItem
        label={res.change24h}
        value={change.text}
        valueClassName={
          change.isPositive
            ? 'text-theme-status-success'
            : change.isNegative
              ? 'text-theme-status-danger'
              : 'text-theme-text-primary'
        }
      />
      <MetricItem label={res.high24h} value={formatUsd(data?.highPrice)} />
      <MetricItem label={res.low24h} value={formatUsd(data?.lowPrice)} />
      <MetricItem
        label={res.volume24h}
        value={formatUsd(data?.volumeQuote)}
        valueClassName="text-theme-text-secondary"
      />
    </div>
  );
}
