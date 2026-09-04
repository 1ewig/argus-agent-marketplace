'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export function ActiveTradesCard() {
  const activeTrades = APP_CONTENT.cards.activeTrades;

  // 36-tick segmented frequency / velocity meter replicating reference design
  const tickCount = 36;
  const activeStart = 20;
  const activeEnd = 28;

  return (
    <div className="bg-theme-bg-overlay border border-theme-border-strong rounded-2xl p-spacing-md sm:p-spacing-lg shadow-md text-white flex flex-col justify-between flex-1 min-h-0">
      {/* Top Bar with Category & Overflow */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/70">
          {activeTrades.title}
        </span>
        <button
          type="button"
          aria-label={activeTrades.title}
          className="text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Metric Row with Colossal Value and Side Counters */}
      <div className="flex items-end justify-between my-auto py-spacing-xs">
        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          {activeTrades.value}
        </div>

        <div className="flex flex-col items-end gap-0.5 text-xs text-white/80 font-mono">
          <div className="flex items-center gap-2">
            <span>{activeTrades.checksLabel}</span>
            <span className="text-theme-brand-binance font-semibold">
              {activeTrades.activeLabel}
            </span>
          </div>
          <span className="text-white/50">{activeTrades.totalLabel}</span>
        </div>
      </div>

      {/* Segmented Audio-Style Velocity Meter */}
      <div className="flex items-center gap-0.5 sm:gap-1 w-full pt-spacing-xs" aria-hidden="true">
        {Array.from({ length: tickCount }).map((_, i) => {
          const isCanaryYellow = i >= activeStart && i <= activeEnd;
          const isFilled = i < activeStart;

          return (
            <span
              key={i}
              className={`flex-1 h-5 rounded-xs transition-all ${
                isCanaryYellow
                  ? 'bg-theme-brand-binance shadow-xs'
                  : isFilled
                  ? 'bg-white/80'
                  : 'bg-white/20'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
