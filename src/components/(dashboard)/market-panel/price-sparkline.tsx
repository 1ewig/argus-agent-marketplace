'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { APP_CONTENT } from '@/constants/content';
import { getPrecisionForPrice } from '@/lib/binance-websocket';

interface PriceSparklineProps {
  symbol: string;
  currentPrice?: number;
}

export const PriceSparkline = React.memo(function PriceSparkline({
  symbol,
  currentPrice,
}: PriceSparklineProps) {
  const content = APP_CONTENT.marketPanel;
  const cleanSymbol = symbol.trim().toUpperCase().replace(/[/\\_-]/g, '');

  const [points, setPoints] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prevSymbol, setPrevSymbol] = useState(cleanSymbol);

  // Sync state on symbol switch during render
  if (prevSymbol !== cleanSymbol) {
    setPrevSymbol(cleanSymbol);
    setPoints([]);
    setIsLoading(true);
  }

  // Fetch initial 30 1-minute klines
  useEffect(() => {
    if (!cleanSymbol || cleanSymbol === 'GLOBAL') return;

    let isDisposed = false;
    const abortController = new AbortController();

    const fetchKlines = async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=1m&limit=30`,
          { signal: abortController.signal }
        );

        if (!res.ok || isDisposed) return;

        const data = (await res.json()) as Array<[number, string, string, string, string, ...unknown[]]>;
        if (!Array.isArray(data) || isDisposed) return;

        // data[i][4] is the close price string
        const closes = data.map((candle) => Number.parseFloat(candle[4]) || 0).filter((p) => p > 0);
        setPoints(closes);
        setIsLoading(false);
      } catch (err: unknown) {
        if (isDisposed || (err instanceof DOMException && err.name === 'AbortError')) return;
        setIsLoading(false);
      }
    };

    fetchKlines();

    return () => {
      isDisposed = true;
      abortController.abort();
    };
  }, [cleanSymbol]);

  // Update latest point with live incoming ticker price
  const lastPriceRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (typeof currentPrice !== 'number' || currentPrice <= 0) return;
    if (currentPrice === lastPriceRef.current) return;
    lastPriceRef.current = currentPrice;

    setPoints((prev) => {
      if (prev.length === 0) return [currentPrice];
      const next = [...prev];
      // Update the current candle close price in real time
      next[next.length - 1] = currentPrice;
      return next;
    });
  }, [currentPrice]);

  // SVG dimensions
  const width = 260;
  const height = 52;
  const paddingY = 6;

  const { minPrice, maxPrice, isUp, pathD, areaD, lastX, lastY, precision } = useMemo(() => {
    if (points.length < 2) {
      return {
        minPrice: 0,
        maxPrice: 0,
        isUp: true,
        pathD: '',
        areaD: '',
        lastX: 0,
        lastY: 0,
        precision: 2,
      };
    }

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const prec = getPrecisionForPrice(max);

    const first = points[0] ?? 0;
    const last = points[points.length - 1] ?? 0;
    const up = last >= first;

    const usableHeight = height - paddingY * 2;
    const stepX = width / (points.length - 1);

    const coords = points.map((p, i) => {
      const x = Number((i * stepX).toFixed(1));
      // Invert Y so highest price is at the top
      const normalizedY = 1 - (p - min) / range;
      const y = Number((paddingY + normalizedY * usableHeight).toFixed(1));
      return { x, y };
    });

    // Build SVG smooth path
    const pathSegments = coords.map((pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `L ${pt.x},${pt.y}`));
    const linePath = pathSegments.join(' ');

    const lastCoord = coords[coords.length - 1] ?? { x: width, y: height };
    const firstCoord = coords[0] ?? { x: 0, y: height };
    const areaPath = `${linePath} L ${lastCoord.x},${height} L ${firstCoord.x},${height} Z`;

    return {
      minPrice: min,
      maxPrice: max,
      isUp: up,
      pathD: linePath,
      areaD: areaPath,
      lastX: lastCoord.x,
      lastY: lastCoord.y,
      precision: prec,
    };
  }, [points, height, width]);

  const strokeColor = isUp ? 'var(--color-theme-status-success)' : 'var(--color-theme-status-danger)';
  const gradId = `sparkline-grad-${cleanSymbol}`;

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

  if (points.length < 2) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 pt-1">
      {/* Sparkline Micro Header */}
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
              ${minPrice.toLocaleString('en-US', { minimumFractionDigits: precision, maximumFractionDigits: precision })}
            </span>
          </span>
          <span>
            {content.sparklineHigh}:{' '}
            <span className="text-theme-text-secondary font-medium">
              ${maxPrice.toLocaleString('en-US', { minimumFractionDigits: precision, maximumFractionDigits: precision })}
            </span>
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[52px] overflow-hidden rounded-lg bg-theme-bg-elevated/25 border border-theme-border-subtle/50 px-1 pt-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.28} />
              <stop offset="85%" stopColor={strokeColor} stopOpacity={0.02} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Area Gradient Fill */}
          <path d={areaD} fill={`url(#${gradId})`} />

          {/* Sparkline Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pulsing Tip for Current Price */}
          <circle cx={lastX} cy={lastY} r="3" fill={strokeColor} />
          <circle
            cx={lastX}
            cy={lastY}
            r="6"
            fill={strokeColor}
            opacity="0.35"
            className="animate-ping"
          />
        </svg>
      </div>
    </div>
  );
});

PriceSparkline.displayName = 'PriceSparkline';
