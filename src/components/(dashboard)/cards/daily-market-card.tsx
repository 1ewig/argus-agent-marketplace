'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export function DailyMarketCard() {
  const analysis = APP_CONTENT.cards.marketAnalysis;

  return (
    <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-2xl p-spacing-md shadow-xs flex flex-col items-center justify-center text-center flex-1 min-h-0 gap-spacing-xs">
      <div className="size-10 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center text-theme-brand-binance mb-1 shadow-2xs">
        <Compass className="size-5" />
      </div>
      <span className="text-2xs font-extrabold uppercase tracking-widest text-theme-brand-binance px-2 py-0.5 rounded-full bg-theme-brand-binance/10 border border-theme-brand-binance/30">
        {analysis.badge}
      </span>
      <h4 className="text-xs font-bold text-theme-text-primary mt-1">
        {analysis.emptyTitle}
      </h4>
      <p className="text-2xs text-theme-text-secondary max-w-xs leading-relaxed">
        {analysis.emptySubtitle}
      </p>
    </div>
  );
}
