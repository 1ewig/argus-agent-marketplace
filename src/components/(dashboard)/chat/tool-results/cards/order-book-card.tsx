import React from 'react';
import { APP_CONTENT } from '@/constants/content';
import { formatUsd, formatOrderQty, MetricItem } from '../helpers';
import type { ToolCardProps } from '../types';

export function OrderBookCard({ resultObj }: ToolCardProps) {
  const res = APP_CONTENT.process.results;
  const summary = (resultObj?.summary as Record<string, unknown>) ?? {};
  const bids = Array.isArray(resultObj?.bids) ? (resultObj.bids as Array<[number, number]>).slice(0, 3) : [];
  const asks = Array.isArray(resultObj?.asks) ? (resultObj.asks as Array<[number, number]>).slice(0, 3) : [];

  const maxBidQty = Math.max(...bids.map(([, q]) => Number(q) || 0), 0.0001);
  const maxAskQty = Math.max(...asks.map(([, q]) => Number(q) || 0), 0.0001);

  const totalBidQty = bids.reduce((acc, [, q]) => acc + (Number(q) || 0), 0);
  const totalAskQty = asks.reduce((acc, [, q]) => acc + (Number(q) || 0), 0);
  const totalDepth = totalBidQty + totalAskQty || 1;
  const bidRatio = Math.round((totalBidQty / totalDepth) * 100);

  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
      {/* Top Stat Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 border-b border-theme-border-subtle/50">
        <MetricItem
          label={res.bestBid}
          value={formatUsd(summary.bestBid)}
          valueClassName="text-theme-status-success"
        />
        <MetricItem
          label={res.bestAsk}
          value={formatUsd(summary.bestAsk)}
          valueClassName="text-theme-status-danger"
        />
        <MetricItem
          label={res.spread}
          value={formatUsd(summary.spread)}
          badge={
            <span className="text-[10px] text-theme-text-muted font-normal">
              ({String(summary.spreadPercent ?? 0)}%)
            </span>
          }
        />
        <MetricItem
          label={res.depthImbalance}
          value={`${String(summary.depthImbalanceRatio ?? '1.0')}x`}
          valueClassName="text-theme-text-secondary"
        />
      </div>

      {/* Depth Balance Bar */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-theme-text-muted">
        <span className="text-theme-status-success font-semibold">{bidRatio}%</span>
        <div className="flex-1 h-1 rounded-full bg-theme-bg-surface overflow-hidden flex">
          <div
            className="h-full bg-theme-status-success/60 transition-all duration-300"
            style={{ width: `${bidRatio}%` }}
          />
          <div
            className="h-full bg-theme-status-danger/60 transition-all duration-300"
            style={{ width: `${100 - bidRatio}%` }}
          />
        </div>
        <span className="text-theme-status-danger font-semibold">{100 - bidRatio}%</span>
      </div>

      {/* Micro Order Book Ladder */}
      {(bids.length > 0 || asks.length > 0) && (
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
          {/* Bids */}
          <div className="flex flex-col gap-0.5">
            {bids.map(([p, q], i) => {
              const qty = Number(q) || 0;
              const fillPercent = Math.min(100, Math.round((qty / maxBidQty) * 100));
              return (
                <div
                  key={`bid_${i}`}
                  className="relative flex justify-between items-center px-1.5 py-0.5 rounded overflow-hidden"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-theme-status-success/10 rounded pointer-events-none"
                    style={{ width: `${fillPercent}%` }}
                  />
                  <span className="relative z-10 text-theme-status-success font-semibold">
                    {formatUsd(p)}
                  </span>
                  <span className="relative z-10 text-theme-text-muted text-[10px]">
                    {formatOrderQty(q)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Asks */}
          <div className="flex flex-col gap-0.5">
            {asks.map(([p, q], i) => {
              const qty = Number(q) || 0;
              const fillPercent = Math.min(100, Math.round((qty / maxAskQty) * 100));
              return (
                <div
                  key={`ask_${i}`}
                  className="relative flex justify-between items-center px-1.5 py-0.5 rounded overflow-hidden"
                >
                  <div
                    className="absolute inset-y-0 right-0 bg-theme-status-danger/10 rounded pointer-events-none"
                    style={{ width: `${fillPercent}%` }}
                  />
                  <span className="relative z-10 text-theme-status-danger font-semibold">
                    {formatUsd(p)}
                  </span>
                  <span className="relative z-10 text-theme-text-muted text-[10px]">
                    {formatOrderQty(q)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
