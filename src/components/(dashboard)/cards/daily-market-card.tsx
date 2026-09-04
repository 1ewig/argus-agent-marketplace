'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export function DailyMarketCard() {
  const analysis = APP_CONTENT.cards.marketAnalysis;

  return (
    <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-2xl p-spacing-md sm:p-spacing-lg shadow-sm flex flex-col justify-between flex-1 min-h-0">
      {/* Top Bar with Category & Overflow */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-theme-text-muted">
          {analysis.title}
        </span>
        <button
          type="button"
          aria-label={analysis.title}
          className="text-theme-text-muted hover:text-theme-text-primary transition-colors cursor-pointer"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Geometric Concentric Arcs Display */}
      <div className="relative flex items-center justify-center my-auto py-1">
        <svg
          viewBox="0 0 280 110"
          className="w-full max-w-[260px] h-auto overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Arc 1 (Inner) */}
          <path
            d="M 40 100 A 60 60 0 0 1 160 100"
            stroke="var(--theme-border-strong)"
            strokeWidth="1.2"
            strokeDasharray="2 0"
          />
          {/* Arc 2 (Middle - Highlighted) */}
          <path
            d="M 30 100 A 85 85 0 0 1 200 100"
            stroke="var(--theme-border-strong)"
            strokeWidth="1.4"
          />
          {/* Arc 3 (Outer) */}
          <path
            d="M 20 100 A 110 110 0 0 1 240 100"
            stroke="var(--theme-border-strong)"
            strokeWidth="1.2"
          />

          {/* Anchor Points */}
          <circle cx="20" cy="100" r="2.5" fill="var(--theme-border-strong)" />
          <circle cx="30" cy="100" r="2.5" fill="var(--theme-border-strong)" />
          <circle cx="40" cy="100" r="2.5" fill="var(--theme-border-strong)" />
          <circle cx="160" cy="100" r="2.5" fill="var(--theme-border-strong)" />
          <circle cx="200" cy="100" r="2.5" fill="var(--theme-border-strong)" />
          <circle cx="240" cy="100" r="2.5" fill="var(--theme-border-strong)" />
        </svg>
      </div>

      {/* Colossal Stat and Split Labels */}
      <div className="flex items-end justify-between pt-spacing-xs border-t border-theme-border-subtle">
        <span className="text-xs font-medium text-theme-text-secondary">
          {analysis.bidsLabel}
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-theme-text-primary tracking-tight font-sans leading-none">
          {analysis.value}
        </div>
        <span className="text-xs font-medium text-theme-text-secondary text-right">
          {analysis.asksLabel}
        </span>
      </div>
    </div>
  );
}
