import React from 'react';
import { APP_CONTENT } from '@/constants/content';
import { formatUsd } from '../helpers';
import type { ToolCardProps } from '../types';

export function AveragePriceCard({ resultObj }: ToolCardProps) {
  const res = APP_CONTENT.process.results;
  const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
  const avgPrice = typeof data?.price === 'number' ? data.price : Number(data?.price);
  const mins = data?.mins ?? 5;

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
      <div className="flex items-center gap-2">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-theme-brand-binance/10 text-theme-brand-binance border border-theme-brand-binance/20">
          {String(mins)}m VWAP
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-text-muted">
          {res.averagePrice}
        </span>
      </div>
      <span className="font-mono text-xs font-bold text-theme-text-primary">
        {formatUsd(avgPrice)}
      </span>
    </div>
  );
}
