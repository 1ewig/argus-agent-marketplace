'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export function ActiveTradesCard() {
  const activeTrades = APP_CONTENT.cards.activeTrades;

  return (
    <div className="bg-theme-bg-overlay border border-theme-border-strong rounded-2xl p-spacing-lg shadow-md text-theme-bg-surface flex flex-col items-center justify-center text-center flex-1 min-h-0 gap-spacing-xs">
      <div className="size-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-theme-brand-binance mb-2 shadow-2xs">
        <Layers className="size-6" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-theme-brand-binance px-2.5 py-0.5 rounded-full bg-theme-brand-binance/20 border border-theme-brand-binance/30">
        {activeTrades.badge}
      </span>
      <h4 className="text-base sm:text-lg font-bold text-white mt-1 tracking-tight">
        {activeTrades.emptyTitle}
      </h4>
      <p className="text-xs sm:text-sm text-white/60 max-w-xs leading-relaxed">
        {activeTrades.emptySubtitle}
      </p>
    </div>
  );
}
