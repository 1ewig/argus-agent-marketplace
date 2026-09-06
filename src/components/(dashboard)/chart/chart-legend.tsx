'use client';

import React, { memo } from 'react';
import { APP_CONTENT } from '@/constants/content';
import type { ChartCandleItem } from './candlestick-canvas';

export interface ChartLegendProps {
  candle: ChartCandleItem | null;
  precision?: number;
}

export const ChartLegend = memo(function ChartLegend({
  candle,
  precision = 2,
}: ChartLegendProps) {
  const legendContent = APP_CONTENT.chart.legend;

  if (!candle) {
    return null;
  }

  const { open, high, low, close } = candle;
  const diff = close - open;
  const changePercent = open > 0 ? (diff / open) * 100 : 0;
  const isPositive = diff >= 0;
  const sign = isPositive ? '+' : '';

  return (
    <div className="flex flex-col gap-1 text-xs select-none pointer-events-none">
      {/* OHLC Bar Legend (pointer-events-none so crosshairs interact seamlessly) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-2xs sm:text-xs text-theme-text-muted">
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
