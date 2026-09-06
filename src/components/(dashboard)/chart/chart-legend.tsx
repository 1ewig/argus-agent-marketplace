'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import type { ChartCandleItem } from './candlestick-canvas';

export interface ChartLegendProps {
  symbol: string;
  candle: ChartCandleItem | null;
  precision?: number;
  onOpenSymbolSearch?: () => void;
}

export const ChartLegend = memo(function ChartLegend({
  symbol,
  candle,
  precision = 2,
  onOpenSymbolSearch,
}: ChartLegendProps) {
  const legendContent = APP_CONTENT.chart.legend;

  const mobileSymbolPill = (
    <div className="md:hidden">
      <motion.button
        type="button"
        whileTap={tapScalePill}
        onClick={onOpenSymbolSearch}
        title={APP_CONTENT.chat.switchSymbolTooltip}
        className="pointer-events-auto inline-flex items-center gap-1 text-theme-text-primary hover:text-theme-brand-binance transition-colors cursor-pointer select-none"
      >
        <span className="font-bold text-sm tracking-wide">
          {symbol}
        </span>
        <ChevronDown className="size-3.5 text-theme-text-muted" />
      </motion.button>
    </div>
  );

  if (!candle) {
    return (
      <div className="flex flex-col gap-1 text-xs select-none">
        {mobileSymbolPill}
      </div>
    );
  }

  const { open, high, low, close } = candle;
  const diff = close - open;
  const changePercent = open > 0 ? (diff / open) * 100 : 0;
  const isPositive = diff >= 0;
  const sign = isPositive ? '+' : '';

  return (
    <div className="flex flex-col gap-1 text-xs select-none">
      {/* Mobile-only Symbol & TF selector pill (hidden on desktop view) */}
      {mobileSymbolPill}

      {/* OHLC Bar Legend (pointer-events-none so crosshairs interact seamlessly) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-2xs sm:text-xs text-theme-text-muted pointer-events-none">
        <div className="flex items-center gap-1">
          <span>{legendContent.open}:</span>
          <span className="text-theme-text-primary font-medium">{open.toFixed(precision)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{legendContent.high}:</span>
          <span className="text-theme-text-primary font-medium">{high.toFixed(precision)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{legendContent.low}:</span>
          <span className="text-theme-text-primary font-medium">{low.toFixed(precision)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{legendContent.close}:</span>
          <span className="text-theme-text-primary font-medium">{close.toFixed(precision)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{legendContent.change}:</span>
          <span
            className={`font-semibold ${
              isPositive ? 'text-theme-positive-base' : 'text-theme-negative-base'
            }`}
          >
            {sign}{diff.toFixed(precision)} ({sign}{changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
});
