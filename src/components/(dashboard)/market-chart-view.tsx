'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export function MarketChartView() {
  const chartContent = APP_CONTENT.cards.chart;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-theme-bg-surface border border-theme-border-subtle rounded-2xl p-spacing-xl shadow-xs text-center">
      {/* Icon Badge */}
      <div className="size-16 rounded-2xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center mb-spacing-md shadow-2xs">
        <BarChart3 className="size-8 text-theme-brand-binance" />
      </div>

      {/* Pill Badge */}
      <span className="text-xs font-bold uppercase tracking-widest text-theme-brand-binance px-spacing-sm py-0.5 rounded-full bg-theme-brand-binance/10 border border-theme-brand-binance/30 mb-spacing-xs">
        {chartContent.badge}
      </span>

      {/* Colossal Title & Description */}
      <h3 className="text-2xl sm:text-3xl font-extrabold text-theme-text-primary tracking-tight mb-spacing-xs font-sans">
        {chartContent.emptyTitle}
      </h3>
      <p className="text-sm sm:text-base text-theme-text-secondary max-w-md leading-relaxed mb-spacing-md">
        {chartContent.emptySubtitle}
      </p>

      {/* Hint Box */}
      <div className="text-xs font-medium text-theme-text-muted bg-theme-bg-elevated border border-theme-border-subtle rounded-xl px-spacing-md py-spacing-xs max-w-sm">
        {chartContent.switchHint}
      </div>
    </div>
  );
}
