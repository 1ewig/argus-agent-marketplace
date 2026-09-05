import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { formatUsd, formatOrderQty } from '../helpers';
import type { ToolCardProps } from '../types';

export function RecentTradesCard({ resultObj }: ToolCardProps) {
  const res = APP_CONTENT.process.results;
  const summary = (resultObj?.summary as Record<string, unknown>) ?? {};
  const trades = Array.isArray(resultObj?.trades)
    ? (resultObj.trades as Array<{ id: number; price: number; qty: number; time: number; isBuyerMaker: boolean }>).slice(0, 3)
    : [];
  const buyRatio = typeof summary?.buyRatio === 'number' ? summary.buyRatio : 50;

  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
      {/* Header / Pressure indicator */}
      <div className="flex items-center justify-between pb-1.5 border-b border-theme-border-subtle/50 text-[10px]">
        <span className="font-semibold uppercase tracking-wider text-theme-text-muted">
          {res.recentTrades}
        </span>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-theme-text-muted">{res.buyPressure}:</span>
          <span
            className={`font-bold ${
              buyRatio >= 50 ? 'text-theme-status-success' : 'text-theme-status-danger'
            }`}
          >
            {buyRatio}%
          </span>
        </div>
      </div>

      {/* Compact Trades List */}
      {trades.length > 0 && (
        <div className="flex flex-col gap-1 font-mono text-[11px]">
          {trades.map((t, idx) => {
            const isBuy = !t.isBuyerMaker;
            return (
              <div
                key={t.id ?? `tr_${idx}`}
                className="flex items-center justify-between px-1 py-0.5 rounded hover:bg-theme-bg-surface/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isBuy ? (
                    <ArrowUpRight className="size-3 text-theme-status-success shrink-0" />
                  ) : (
                    <ArrowDownRight className="size-3 text-theme-status-danger shrink-0" />
                  )}
                  <span
                    className={`font-semibold ${
                      isBuy ? 'text-theme-status-success' : 'text-theme-status-danger'
                    }`}
                  >
                    {formatUsd(t.price)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-theme-text-secondary">{formatOrderQty(t.qty)}</span>
                  <span className="text-theme-text-muted">
                    {new Date(t.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
