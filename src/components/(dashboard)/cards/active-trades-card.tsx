'use client';

import React from 'react';
import { MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export function ActiveTradesCard() {
  const activeTrades = APP_CONTENT.cards.activeTrades;

  // 36 mini vertical ticks representing order book liquidity depth, with the center/pressure zone highlighted in gold
  const totalTicks = 36;
  const highlightStart = 18;
  const highlightEnd = 27;

  return (
    <div className="bg-theme-bg-overlay border border-theme-border-strong rounded-2xl p-spacing-md shadow-sm text-theme-bg-surface flex flex-col justify-between gap-spacing-sm flex-1 min-h-0">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <span className="text-2xs font-bold text-white/60 uppercase tracking-wider">
          {activeTrades.velocityLabel}
        </span>
        <button
          type="button"
          aria-label={APP_CONTENT.sessions.openMenuAria}
          className="size-6 rounded-md flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <MoreHorizontal className="size-3.5" />
        </button>
      </div>

      {/* Main Ratio Metric and Status Sub-stats */}
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
            {activeTrades.ratioValue}
          </div>
          <div className="flex items-center gap-spacing-xs mt-0.5">
            <span className="text-2xs font-semibold text-theme-brand-binance">
              {activeTrades.bidsLabel}
            </span>
            <span className="text-2xs text-white/40">•</span>
            <span className="text-2xs text-white/70">
              {activeTrades.activeOrdersLabel}
            </span>
          </div>
        </div>

        {/* PnL Indicator */}
        <div className="flex items-center gap-0.5 text-2xs font-mono font-bold text-theme-status-success bg-theme-status-success/15 px-2 py-1 rounded-md border border-theme-status-success/30">
          <ArrowUpRight className="size-3" />
          <span>{activeTrades.pnlLabel}</span>
        </div>
      </div>

      {/* Signature Segmented Bar Depth Meter */}
      <div className="py-spacing-xs">
        <div className="flex items-center justify-between gap-0.5 h-6 bg-white/5 p-1 rounded-lg">
          {Array.from({ length: totalTicks }).map((_, i) => {
            const isHighlighted = i >= highlightStart && i <= highlightEnd;
            const isLeading = i < highlightStart;
            return (
              <div
                key={i}
                className={`flex-1 h-full rounded-xs transition-all ${
                  isHighlighted
                    ? 'bg-theme-brand-binance shadow-xs scale-y-110'
                    : isLeading
                    ? 'bg-white/70'
                    : 'bg-white/15'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Mini Recent Executions */}
      <div className="flex flex-col gap-1 pt-spacing-xs border-t border-white/10">
        <span className="text-2xs font-bold text-white/50 uppercase tracking-wider">
          {activeTrades.recentTradesTitle}
        </span>
        <div className="flex flex-col gap-1">
          {activeTrades.trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between text-2xs font-mono text-white/80"
            >
              <div className="flex items-center gap-spacing-xs">
                <span className="px-1 py-0.2 rounded bg-theme-status-success/20 text-theme-status-success font-bold text-2xs">
                  {trade.side}
                </span>
                <span className="font-semibold text-white">{trade.pair}</span>
                <span className="text-white/40">{trade.amount}</span>
              </div>
              <div className="flex items-center gap-spacing-xs">
                <span>{trade.price}</span>
                <span className="text-white/40 text-2xs">{trade.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
