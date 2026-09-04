'use client';

import React from 'react';
import { Bot, LineChart } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export type StageViewMode = 'agent' | 'chart';

interface StageViewSwitcherProps {
  viewMode: StageViewMode;
  onViewModeChange: (mode: StageViewMode) => void;
}

export function StageViewSwitcher({ viewMode, onViewModeChange }: StageViewSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="View Switcher"
      className="inline-flex items-center bg-theme-bg-elevated p-1 rounded-xl border border-theme-border-subtle shadow-2xs"
    >
      <button
        type="button"
        onClick={() => onViewModeChange('agent')}
        className={`flex items-center gap-spacing-xs px-spacing-md py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          viewMode === 'agent'
            ? 'bg-theme-bg-surface text-theme-text-primary shadow-xs border border-theme-border-subtle font-extrabold'
            : 'text-theme-text-secondary hover:text-theme-text-primary'
        }`}
      >
        <Bot className="size-3.5 text-theme-brand-binance" />
        <span>{APP_CONTENT.stage.switcher.agent}</span>
      </button>

      <button
        type="button"
        onClick={() => onViewModeChange('chart')}
        className={`flex items-center gap-spacing-xs px-spacing-md py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          viewMode === 'chart'
            ? 'bg-theme-bg-surface text-theme-text-primary shadow-xs border border-theme-border-subtle font-extrabold'
            : 'text-theme-text-secondary hover:text-theme-text-primary'
        }`}
      >
        <LineChart className="size-3.5 text-theme-brand-binance" />
        <span>{APP_CONTENT.stage.switcher.chart}</span>
      </button>
    </div>
  );
}
