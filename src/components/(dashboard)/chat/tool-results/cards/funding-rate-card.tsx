import React from 'react';
import { APP_CONTENT } from '@/constants/content';
import { formatUsd, MetricItem } from '../helpers';
import type { ToolCardProps } from '../types';

export function FundingRateCard({ resultObj }: ToolCardProps) {
  const res = APP_CONTENT.process.results;
  const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
  const rate = typeof data?.lastFundingRate === 'number' ? data.lastFundingRate : 0;
  const ratePct = +(rate * 100).toFixed(4);
  const apr =
    typeof data?.annualizedRatePercent === 'number'
      ? data.annualizedRatePercent
      : +(ratePct * 3 * 365).toFixed(2);
  const isPositive = rate > 0;
  const nextTime =
    typeof data?.nextFundingTime === 'number'
      ? new Date(data.nextFundingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '—';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
      <MetricItem
        label={res.fundingRate}
        value={rate > 0 ? `+${ratePct}%` : `${ratePct}%`}
        valueClassName={
          isPositive
            ? 'text-theme-status-success'
            : rate < 0
              ? 'text-theme-status-danger'
              : 'text-theme-text-primary'
        }
      />
      <MetricItem
        label={res.annualizedRate}
        value={`${apr > 0 ? `+${apr}%` : `${apr}%`}`}
        valueClassName="text-theme-brand-binance"
      />
      <MetricItem label={res.markPrice} value={formatUsd(data?.markPrice)} />
      <MetricItem
        label={res.nextFunding}
        value={nextTime}
        valueClassName="text-theme-text-secondary"
      />
    </div>
  );
}
