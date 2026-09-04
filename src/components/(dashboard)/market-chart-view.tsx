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
      <span className="text-2xs font-extrabold uppercase tracking-widest text-theme-brand-binance px-spacing-sm py-0.5 rounded-full bg-theme-brand-binance/10 border border-theme-brand-binance/30 mb-spacing-xs">
        {chartContent.badge}
      </span>

      {/* Title & Description */}
      <h3 className="text-base font-bold text-theme-text-primary mb-spacing-xs">
        {chartContent.emptyTitle}
      </h3>
      <p className="text-xs text-theme-text-secondary max-w-sm leading-relaxed mb-spacing-md">
        {chartContent.emptySubtitle}
      </p>

      {/* Hint Box */}
      <div className="text-2xs font-medium text-theme-text-muted bg-theme-bg-elevated border border-theme-border-subtle rounded-lg px-spacing-md py-spacing-xs max-w-xs">
        {chartContent.switchHint}
      </div>
    </div>
  );
}
