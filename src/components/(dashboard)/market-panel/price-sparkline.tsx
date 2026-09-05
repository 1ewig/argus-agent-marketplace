'use client';

import React, { useState, useEffect, useMemo, useRef, useId } from 'react';
import { APP_CONTENT } from '@/constants/content';
import { getPrecisionForPrice } from '@/lib/binance-websocket';

interface PriceSparklineProps {
  symbol: string;
  currentPrice?: number;
  width?: number;
  height?: number;
}

/**
 * Builds a smoothed cubic Bézier SVG path from discrete coordinates.
 */
function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }

  let d = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    // Catmull-Rom to Cubic Bézier control points
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return d;
}

export const PriceSparkline = React.memo(function PriceSparkline({
  symbol,
  currentPrice,
  width = 260,
  height = 52,
}: PriceSparklineProps) {
  const content = APP_CONTENT.marketPanel;
  const uniqueId = useId().replace(/:/g, '');
  const cleanSymbol = useMemo(
    () => symbol.trim().toUpperCase().replace(/[/\\_-]/g, ''),
    [symbol]
  );

  const [points, setPoints] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Keep track of the current minute bucket so the sparkline slides forward
  const currentBucketMinuteRef = useRef<number>(Math.floor(Date.now() / 60000));
  const lastPriceRef = useRef<number | undefined>(undefined);

  // 1. Fetch initial 30 1-minute klines
  useEffect(() => {
    if (!cleanSymbol || cleanSymbol === 'GLOBAL') {
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    setIsLoading(true);
    setError(false);
    setPoints([]);

    const fetchKlines = async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=1m&limit=30`,
          { signal: abortController.signal }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as Array<[number, string, string, string, string, ...unknown[]]>;
        if (!Array.isArray(data)) return;

        // candle[4] = close price, candle[0] = open time
        const closes: number[] = [];
        let lastCandleTime = Date.now();

        for (const candle of data) {
          const close = Number.parseFloat(candle[4]);
          if (Number.isFinite(close) && close > 0) {
            closes.push(close);
            lastCandleTime = candle[0];
          }
        }

        currentBucketMinuteRef.current = Math.floor(lastCandleTime / 60000);
        setPoints(closes);
        setIsLoading(false);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(true);
        setIsLoading(false);
      }
    };

    fetchKlines();

    return () => {
      abortController.abort();
    };
  }, [cleanSymbol]);

  // 2. Real-time candle rollover + live tick updates
  useEffect(() => {
    if (typeof currentPrice !== 'number' || currentPrice <= 0 || !Number.isFinite(currentPrice)) {
      return;
    }
    if (currentPrice === lastPriceRef.current) return;
    lastPriceRef.current = currentPrice;

    const nowMinute = Math.floor(Date.now() / 60000);

    setPoints((prev) => {
      if (prev.length === 0) return [currentPrice];

      // If a new minute has started, append a new candle and trim to keep 30 points max
      if (nowMinute > currentBucketMinuteRef.current) {
        currentBucketMinuteRef.current = nowMinute;
        const next = [...prev.slice(-29), currentPrice];
        return next;
      }

      // Otherwise update the active minute candle
      const next = [...prev];
      next[next.length - 1] = currentPrice;
      return next;
    });
  }, [currentPrice]);

  // 3. Compute sparkline geometry
  const paddingY = 8;
  const { minPrice, maxPrice, isUp, pathD, areaD, lastPercentX, lastPercentY, precision } =
    useMemo(() => {
      if (points.length < 2) {
        return {
          minPrice: 0,
          maxPrice: 0,
          isUp: true,
          pathD: '',
          areaD: '',
          lastPercentX: 100,
          lastPercentY: 50,
          precision: 2,
        };
      }

      const min = Math.min(...points);
      const max = Math.max(...points);
      const range = max - min;
      const prec = getPrecisionForPrice(max);

      const first = points[0] ?? 0;
      const last = points[points.length - 1] ?? 0;
      const up = last >= first;

      const usableHeight = height - paddingY * 2;
      const stepX = width / (points.length - 1);

      const coords = points.map((p, i) => {
        const x = Number((i * stepX).toFixed(1));
        // Guard flatline (range === 0) by centering vertically
        const normalizedY = range === 0 ? 0.5 : 1 - (p - min) / range;
        const y = Number((paddingY + normalizedY * usableHeight).toFixed(1));
        return { x, y };
      });

      const smoothedLine = buildSmoothPath(coords);
      const lastCoord = coords[coords.length - 1];
      const firstCoord = coords[0];

      const area = `${smoothedLine} L ${lastCoord.x},${height} L ${firstCoord.x},${height} Z`;

      return {
        minPrice: min,
        maxPrice: max,
        isUp: up,
        pathD: smoothedLine,
        areaD: area,
        // Percentage coordinates for non-distorted HTML dot positioning
        lastPercentX: (lastCoord.x / width) * 100,
        lastPercentY: (lastCoord.y / height) * 100,
        precision: prec,
      };
    }, [points, height, width]);

  const strokeColor = isUp
    ? 'var(--color-theme-status-success)'
    : 'var(--color-theme-status-danger)';

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
              ${minPrice.toLocaleString('en-US', {
                minimumFractionDigits: precision,
                maximumFractionDigits: precision,
              })}
            </span>
          </span>
          <span>
            {content.sparklineHigh}:{' '}
            <span className="text-theme-text-secondary font-medium">
              ${maxPrice.toLocaleString('en-US', {
                minimumFractionDigits: precision,
                maximumFractionDigits: precision,
              })}
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