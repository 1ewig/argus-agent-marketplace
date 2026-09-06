'use client';

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import {
  createChart,
  CandlestickSeries,
  CrosshairMode,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type UTCTimestamp,
  type MouseEventParams,
  type Time,
} from 'lightweight-charts';

export interface ChartCandleItem {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface CandlestickCanvasHandle {
  zoomToRecent: () => void;
  updateCandle: (candle: ChartCandleItem) => void;
}

export interface CandlestickCanvasProps {
  candles: ChartCandleItem[];
  precision?: number;
  onCrosshairMove?: (candle: ChartCandleItem | null) => void;
}

// Minimal, refined palette
const UP_COLOR = '#0ecb81';
const DOWN_COLOR = '#f6465d';
const MUTED_TEXT = '#5e6673';
const CROSSHAIR_LINE = 'rgba(255, 255, 255, 0.12)';
const BADGE_BG = '#161a1e';

export const CandlestickCanvas = forwardRef<CandlestickCanvasHandle, CandlestickCanvasProps>(
  function CandlestickCanvas({ candles, precision = 2, onCrosshairMove }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const candlesRef = useRef<ChartCandleItem[]>(candles);

    const zoomToRecent = useCallback(() => {
      if (!chartRef.current || !candlesRef.current.length) return;
      const total = candlesRef.current.length;
      const visibleBars = 36;
      chartRef.current.timeScale().setVisibleLogicalRange({
        from: Math.max(0, total - visibleBars),
        to: total + 4,
      });
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        zoomToRecent,
        updateCandle: (candle: ChartCandleItem) => {
          if (seriesRef.current) {
            seriesRef.current.update(candle as CandlestickData<UTCTimestamp>);
          }
        },
      }),
      [zoomToRecent]
    );

    // Initialize minimal Lightweight Charts canvas
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const chart = createChart(container, {
        layout: {
          attributionLogo: false,
          background: { color: 'transparent' },
          textColor: MUTED_TEXT,
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
        },
        // Remove all grid lines for an unobstructed canvas
        grid: {
          vertLines: { visible: false },
          horzLines: { visible: false },
        },
        // Ultra-subtle, minimal crosshairs
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: CROSSHAIR_LINE,
            width: 1,
            style: LineStyle.Dotted,
            labelBackgroundColor: BADGE_BG,
          },
          horzLine: {
            color: CROSSHAIR_LINE,
            width: 1,
            style: LineStyle.Dotted,
            labelBackgroundColor: BADGE_BG,
          },
        },
        // Frameless price scale with breathing margins
        rightPriceScale: {
          borderVisible: false,
          scaleMargins: { top: 0.14, bottom: 0.14 },
          autoScale: true,
          mode: 0,
        },
        // Frameless time scale
        timeScale: {
          borderVisible: false,
          timeVisible: true,
          secondsVisible: false,
          barSpacing: 18,
          minBarSpacing: 6,
          rightOffset: 8,
        },
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: UP_COLOR,
        downColor: DOWN_COLOR,
        borderVisible: false,
        wickUpColor: UP_COLOR,
        wickDownColor: DOWN_COLOR,
        // Hide full-canvas horizontal price projection line, keep badge on axis
        priceLineVisible: false,
        lastValueVisible: true,
        priceFormat: {
          type: 'price',
          precision,
          minMove: 1 / Math.pow(10, precision),
        },
      });

      chartRef.current = chart;
      seriesRef.current = series;

      // Handle Crosshair sync
      const handleCrosshair = (param: MouseEventParams<Time>) => {
        if (!onCrosshairMove) return;
        if (!param || !param.time || !param.seriesData) {
          onCrosshairMove(null);
          return;
        }

        const bar = param.seriesData.get(series) as CandlestickData<UTCTimestamp> | undefined;
        if (bar && typeof bar.open === 'number') {
          onCrosshairMove({
            time: bar.time,
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
          });
        } else {
          onCrosshairMove(null);
        }
      };

      chart.subscribeCrosshairMove(handleCrosshair);

      // Auto-resize on container resize
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry && entry.contentRect) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            chart.applyOptions({ width, height });
          }
        }
      });
      resizeObserver.observe(container);

      return () => {
        chart.unsubscribeCrosshairMove(handleCrosshair);
        resizeObserver.disconnect();
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
      };
    }, [precision, onCrosshairMove]);

    // Update historical candle dataset
    useEffect(() => {
      candlesRef.current = candles;
      if (!seriesRef.current || !candles.length) return;
      seriesRef.current.setData(candles as CandlestickData<UTCTimestamp>[]);
      zoomToRecent();
    }, [candles, zoomToRecent]);

    return (
      <div className="relative w-full h-full min-h-[320px] overflow-hidden select-none bg-transparent">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    );
  }
);