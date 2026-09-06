'use client';

import React, { useId } from 'react';
import { APP_CONTENT } from '@/constants/content';
import { formatPrice } from '@/lib/utils';
import { useSparklineData, useSparklineGeometry } from '@/hooks';

interface PriceSparklineProps {
  symbol: string;
  currentPrice?: number;
  width?: number;
  height?: number;
}

export const PriceSparkline = React.memo(function PriceSparkline({
  symbol,
  currentPrice,
  width = 260,
  height = 52,
}: PriceSparklineProps) {
  const content = APP_CONTENT.marketPanel;
  const uniqueId = useId().replace(/:/g, '');

  const { points, isLoading, error, cleanSymbol } = useSparklineData(symbol, currentPrice);
  const {
    minPrice,
    maxPrice,
    pathD,
    areaD,
    lastPercentX,
    lastPercentY,
    precision,
    strokeColor,
  } = useSparklineGeometry(points, { width, height });

  const gradId = `sparkline-grad-${cleanSymbol}-${uniqueId}`;

  // Skeleton state
  if (isLoading && points.length === 0) {
    return (
      <div className="flex flex-col gap-1.5 py-1">
        <div className="flex items-center justify-between text-2xs font-mono text-theme-text-muted">
          <span>{content.sparklineTitle}</span>
          <span>{content.sparklineCandles}</span>
        </div>
        <div className="h-[52px] w-full bg-theme-bg-elevated/40 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Error / empty fallback
  if (error || points.length < 2) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between text-[11px] font-mono text-theme-text-muted select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-theme-text-secondary">{content.sparklineTitle}</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-theme-bg-elevated text-theme-text-muted font-bold">
            {content.sparklineCandles}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span>
            {content.sparklineLow}:{' '}
            <span className="text-theme-text-secondary font-medium">
              ${formatPrice(minPrice, precision)}
            </span>
          </span>
          <span>
            {content.sparklineHigh}:{' '}
            <span className="text-theme-text-secondary font-medium">
              ${formatPrice(maxPrice, precision)}
            </span>
          </span>
        </div>
      </div>

      {/* Graph Viewport */}
      <div className="relative w-full h-[52px] overflow-hidden rounded-lg bg-theme-bg-elevated/25 border border-theme-border-subtle/50">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="70%" stopColor={strokeColor} stopOpacity={0.03} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Fill */}
          <path d={areaD} fill={`url(#${gradId})`} />

          {/* Smooth Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* 
          Positioned with CSS percentages: 
          Guarantees the pulsating dot remains a PERFECT circle regardless of aspect ratio stretch 
        */}
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center size-3"
          style={{
            left: `${lastPercentX}%`,
            top: `${lastPercentY}%`,
          }}
        >
          <span
            className="absolute size-3 rounded-full animate-ping opacity-40"
            style={{ backgroundColor: strokeColor }}
          />
          <span
            className="relative size-1.5 rounded-full shadow-xs"
            style={{ backgroundColor: strokeColor }}
          />
        </div>
      </div>
    </div>
  );
});

PriceSparkline.displayName = 'PriceSparkline';