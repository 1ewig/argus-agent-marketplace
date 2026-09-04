'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, LineChart } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { useAppStore } from '@/stores/app-store';

export type StageViewMode = 'agent' | 'chart';

interface StageViewSwitcherProps {
  viewMode?: StageViewMode;
  onViewModeChange?: (mode: StageViewMode) => void;
}

export function StageViewSwitcher({ viewMode: propMode, onViewModeChange: propOnChange }: StageViewSwitcherProps = {}) {
  const storeMode = useAppStore((state) => state.stageView);
  const storeSetMode = useAppStore((state) => state.setStageView);

  const viewMode = propMode ?? storeMode;
  const onViewModeChange = propOnChange ?? storeSetMode;
  return (
    <div
      role="group"
      aria-label="View Switcher"
      className="relative inline-grid grid-cols-2 p-1 bg-theme-bg-elevated rounded-xl border border-theme-border-subtle shadow-2xs select-none"
    >
      {/* Sliding Active Pill */}
      <motion.span
        aria-hidden="true"
        animate={{ x: viewMode === 'chart' ? '100%' : '0%' }}
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-theme-bg-surface border border-theme-border-subtle shadow-xs pointer-events-none"
      />

      {/* Agent Option */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => onViewModeChange('agent')}
        className={`relative z-10 flex items-center justify-center gap-spacing-xs px-spacing-md py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer ${viewMode === 'agent'
            ? 'text-theme-text-primary'
            : 'text-theme-text-secondary hover:text-theme-text-primary'
          }`}
      >
        <Bot className="size-3.5 text-theme-brand-binance shrink-0" />
        <span>{APP_CONTENT.stage.switcher.agent}</span>
      </motion.button>

      {/* Chart Option */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => onViewModeChange('chart')}
        className={`relative z-10 flex items-center justify-center gap-spacing-xs px-spacing-md py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer ${viewMode === 'chart'
            ? 'text-theme-text-primary'
            : 'text-theme-text-secondary hover:text-theme-text-primary'
          }`}
      >
        <LineChart className="size-3.5 text-theme-brand-binance shrink-0" />
        <span>{APP_CONTENT.stage.switcher.chart}</span>
      </motion.button>
    </div>
  );
}