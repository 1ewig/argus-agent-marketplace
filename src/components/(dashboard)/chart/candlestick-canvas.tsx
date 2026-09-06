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
  type LogicalRange,
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
  /** Set to true for floating numbers, or false for true edge-to-edge floating candles (default: false) */
  showAxes?: boolean;
  /** Number of empty buffer bars allowed past the first/last candle before clamping (default: 6) */
  boundaryBuffer?: number;
  onCrosshairMove?: (candle: ChartCandleItem | null) => void;
}

const UP_COLOR = '#0ecb81';
const DOWN_COLOR = '#f6465d';

export const CandlestickCanvas = forwardRef<CandlestickCanvasHandle, CandlestickCanvasProps>(
  function CandlestickCanvas(
    {
      candles,
      precision = 2,
      showAxes = false,
      boundaryBuffer = 6,
      onCrosshairMove,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const candlesRef = useRef<ChartCandleItem[]>(candles);
    const isClampingRef = useRef<boolean>(false);

    // Zoom and position to show the latest ~36 candles
    const zoomToRecent = useCallback(() => {
      if (!chartRef.current || !candlesRef.current.length) return;
      const total = candlesRef.current.length;
      const visibleBars = 36;
      chartRef.current.timeScale().setVisibleLogicalRange({
        from: Math.max(0, total - visibleBars),
        to: total + 2,
      });
    }, []);

    // Expose handle methods for the parent component
    useImperativeHandle(
      ref,
      () => ({
        zoomToRecent,
        updateCandle: (candle: ChartCandleItem) => {
          if (!seriesRef.current) return;
          seriesRef.current.update(candle as CandlestickData<UTCTimestamp>);

          // Keep internal array synced so boundary limits dynamically follow live candles
          const arr = candlesRef.current;
          if (arr.length > 0 && arr[arr.length - 1].time === candle.time) {
            arr[arr.length - 1] = candle;
          } else {
            arr.push(candle);
          }
        },
      }),
      [zoomToRecent]
    );

    // Initialize Lightweight Charts instance
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Wipe any orphaned DOM nodes on Next.js Fast Refresh
      container.replaceChildren();

      const chart = createChart(container, {
        layout: {
          attributionLogo: false,
          background: { color: 'transparent' },
          textColor: '#5e6673',
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
        },
        // Remove all grid lines
        grid: {
          vertLines: { visible: false },
          horzLines: { visible: false },
        },
        // Faint, non-intrusive crosshair guides
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: 'rgba(255, 255, 255, 0.08)',
            width: 1,
            style: LineStyle.Dotted,
            labelVisible: showAxes,
          },
          horzLine: {
            color: 'rgba(255, 255, 255, 0.08)',
            width: 1,
            style: LineStyle.Dotted,
            labelVisible: showAxes,
          },
        },
        // Right price axis: completely removed unless showAxes is explicitly true
        rightPriceScale: {
          visible: showAxes,
          borderVisible: false,
          scaleMargins: { top: 0.12, bottom: 0.12 },
          autoScale: true,
        },
        leftPriceScale: {
          visible: false,
        },
        // Bottom time axis: completely removed unless showAxes is explicitly true
        timeScale: {
          visible: showAxes,
          borderVisible: false,
          timeVisible: true,
          secondsVisible: false,
          barSpacing: 16,
          minBarSpacing: 5,
          rightOffset: 4,
        },
        handleScroll: true,
        handleScale: true,
      });

      // Pure floating candlesticks
      const series = chart.addSeries(CandlestickSeries, {
        upColor: UP_COLOR,
        downColor: DOWN_COLOR,
        borderVisible: false,
        wickUpColor: UP_COLOR,
        wickDownColor: DOWN_COLOR,
        priceLineVisible: false,
        lastValueVisible: showAxes,
        priceFormat: {
          type: 'price',
          precision,
          minMove: 1 / Math.pow(10, precision),
        },
      });

      chartRef.current = chart;
      seriesRef.current = series;

      // Restrict panning beyond the start and end of available candles
      const handleLogicalRangeChange = (range: LogicalRange | null) => {
        if (!range || isClampingRef.current || !candlesRef.current.length) return;

        const totalBars = candlesRef.current.length;
        const minAllowedFrom = -boundaryBuffer;
        const maxAllowedTo = totalBars - 1 + boundaryBuffer;
        const maxSpan = maxAllowedTo - minAllowedFrom;
        const currentSpan = range.to - range.from;

        let from: number = range.from;
        let to: number = range.to;
        let clamped = false;

        // 1. Prevent zooming out past total available data
        if (currentSpan > maxSpan) {
          from = minAllowedFrom;
          to = maxAllowedTo;
          clamped = true;
        } else {
          // 2. Prevent dragging too far into the past (left)
          if (from < minAllowedFrom) {
            from = minAllowedFrom;
            to = minAllowedFrom + currentSpan;
            clamped = true;
          }
          // 3. Prevent dragging too far into the future (right)
          if (to > maxAllowedTo) {
            to = maxAllowedTo;
            from = maxAllowedTo - currentSpan;
            clamped = true;
          }
        }

        if (clamped) {
          isClampingRef.current = true;
          chart.timeScale().setVisibleLogicalRange({ from, to });
          requestAnimationFrame(() => {
            isClampingRef.current = false;
          });
        }
      };

      chart.timeScale().subscribeVisibleLogicalRangeChange(handleLogicalRangeChange);

      // Synchronize hover state with external HUD/legend
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

      // Auto-resize on container dimension changes
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry?.contentRect) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            chart.applyOptions({ width, height });
          }
        }
      });
      resizeObserver.observe(container);

      // Load initial candles if already available
      if (candlesRef.current.length > 0) {
        series.setData(candlesRef.current as CandlestickData<UTCTimestamp>[]);
        zoomToRecent();
      }

      return () => {
        chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleLogicalRangeChange);
        chart.unsubscribeCrosshairMove(handleCrosshair);
        resizeObserver.disconnect();
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
      };
    }, [precision, showAxes, boundaryBuffer, onCrosshairMove, zoomToRecent]);

    // Handle dataset changes (timeframe switches, new symbol, etc.)
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

CandlestickCanvas.displayName = 'CandlestickCanvas';