import React from 'react';
import { APP_CONTENT } from '@/constants/content';
import { formatUsd } from '../helpers';
import type { ToolCardProps } from '../types';

export function TickerPriceCard({ resultObj }: ToolCardProps) {
  const res = APP_CONTENT.process.results;
  const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
  const price = data?.price ?? resultObj?.price;
  const symbol = typeof data?.symbol === 'string' ? data.symbol : undefined;

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
      <div className="flex items-center gap-2">
        {symbol && (
          <span className="px-1.5 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider bg-theme-brand-binance/10 text-theme-brand-binance border border-theme-brand-binance/20">
            {symbol}
          </span>
        )}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-text-muted">
          {res.livePrice}
        </span>
      </div>
      <div className="flex items-baseline gap-1 font-mono">
        <span className="text-base font-extrabold text-theme-text-primary tracking-tight">
          {formatUsd(price)}
        </span>
        <span className="text-[10px] font-medium text-theme-text-muted">USD</span>
      </div>
    </div>
  );
}
