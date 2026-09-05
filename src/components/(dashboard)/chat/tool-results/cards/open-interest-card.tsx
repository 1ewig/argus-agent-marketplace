import React from 'react';
import { APP_CONTENT } from '@/constants/content';
import { formatOrderQty } from '../helpers';
import type { ToolCardProps } from '../types';

export function OpenInterestCard({ resultObj }: ToolCardProps) {
  const res = APP_CONTENT.process.results;
  const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
  const openInterest =
    typeof data?.openInterest === 'number'
      ? data.openInterest
      : parseFloat(String(data?.openInterest ?? 0));
  const symbol = typeof data?.symbol === 'string' ? (data.symbol as string) : undefined;
  const time =
    typeof data?.time === 'number'
      ? new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '—';

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
      <div className="flex items-center gap-2">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-theme-brand-accent/10 text-theme-brand-accent border border-theme-brand-accent/20">
          {res.openInterest}
        </span>
        {symbol && <span className="text-xs font-mono font-bold text-theme-text-primary">{symbol}</span>}
      </div>
      <div className="flex items-baseline gap-3 text-[11px] font-mono">
        <div>
          <span className="text-[10px] text-theme-text-muted mr-1.5">{res.openInterestContracts}:</span>
          <span className="font-bold text-theme-text-primary">{formatOrderQty(openInterest)}</span>
        </div>
        <span className="text-[10px] text-theme-text-muted">{time}</span>
      </div>
    </div>
  );
}
