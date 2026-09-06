'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import type { UTCTimestamp } from 'lightweight-charts';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import { isGlobalSymbol } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import {
  CandlestickCanvas,
  type CandlestickCanvasHandle,
  type ChartCandleItem,
} from './candlestick-canvas';
import { ChartLegend } from './chart-legend';

export interface ChartClientProps {
  symbol?: string;
}

export function ChartClient({ symbol: propSymbol }: ChartClientProps) {
  const storeSymbol = useAppStore((state) => state.selectedSymbol);
  const lastActiveSymbol = useAppStore((state) => state.lastActiveSymbol);
  const chartTimeframe = useAppStore((state) => state.chartTimeframe);

  const rawSymbol = propSymbol || storeSymbol || 'BTCUSDT';
  const isGlobal = isGlobalSymbol(rawSymbol);
  const cleanSymbol = (isGlobal ? lastActiveSymbol || 'BTCUSDT' : rawSymbol)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  const timeframes = APP_CONTENT.chart.timeframes;
  const [candles, setCandles] = useState<ChartCandleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [hoveredCandle, setHoveredCandle] = useState<ChartCandleItem | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('connecting');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const canvasRef = useRef<CandlestickCanvasHandle | null>(null);
  const chartWrapperRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const activeTimeframe = useMemo(() => {
    return timeframes.find((tf) => tf.id === chartTimeframe) || timeframes[3];
  }, [timeframes, chartTimeframe]);

  // Determine derived decimal precision based on price level
  const precision = useMemo(() => {
    if (!livePrice && !candles.length) return 2;
    const refPrice = livePrice || (candles.length ? candles[candles.length - 1].close : 100);
    if (refPrice < 0.001) return 6;
    if (refPrice < 1) return 4;
    return 2;
  }, [livePrice, candles]);

  // 1. Fetch Historical Klines from Binance REST API
  useEffect(() => {
    let isCancelled = false;

    const fetchKlines = async () => {
      setIsLoading(true);
      setError(null);
      const url = `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${activeTimeframe.binanceInterval}&limit=${activeTimeframe.limit}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Array<[number, string, string, string, string, string]>;

        if (isCancelled) return;

        const formattedCandles: ChartCandleItem[] = data.map((d) => ({
          time: Math.floor(d[0] / 1000) as UTCTimestamp,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
          volume: parseFloat(d[5]),
        }));

        setCandles(formattedCandles);
        if (formattedCandles.length) {
          const last = formattedCandles[formattedCandles.length - 1];
          setLivePrice(last.close);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('[ChartClient] Failed to load klines:', err);
          setError(APP_CONTENT.chart.loadingError);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchKlines();

    return () => {
      isCancelled = true;
    };
  }, [cleanSymbol, activeTimeframe.binanceInterval, activeTimeframe.limit]);

  // 2. Real-time Binance WebSocket Stream (Kline + Ticker)
  useEffect(() => {
    let ws: WebSocket | null = null;
    let isPaused = false;

    const connectWs = () => {
      if (document.hidden) {
        isPaused = true;
        return;
      }

      setWsStatus('connecting');
      const rawLower = cleanSymbol.toLowerCase();
      const interval = activeTimeframe.binanceInterval;
      const klineStream = `${rawLower}@kline_${interval}`;
      const tickerStream = `${rawLower}@ticker`;
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${klineStream}/${tickerStream}`;

      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsStatus('connected');
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (!payload || !payload.stream) return;

            // Handle Kline tick
            if (payload.stream.endsWith(`@kline_${interval}`)) {
              const k = payload.data.k;
              const newCandle: ChartCandleItem = {
                time: Math.floor(k.t / 1000) as UTCTimestamp,
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: parseFloat(k.c),
                volume: parseFloat(k.v),
              };

              // Send tick update to canvas
              if (canvasRef.current) {
                canvasRef.current.updateCandle(newCandle);
              }

              setLivePrice(newCandle.close);
            }
          } catch (e) {
            console.error('[ChartClient] WS Parse error:', e);
          }
        };

        ws.onerror = () => {
          setWsStatus('error');
        };

        ws.onclose = () => {
          if (!isPaused) {
            setWsStatus('disconnected');
          }
        };
      } catch (err) {
        console.error('[ChartClient] WS Init error:', err);
        setWsStatus('error');
      }
    };

    connectWs();

    // Tab visibility handling (sleep stream when hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        if (ws) ws.close();
      } else {
        isPaused = false;
        connectWs();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (ws) {
        ws.onclose = null;
        ws.close();
        wsRef.current = null;
      }
    };
  }, [cleanSymbol, activeTimeframe.binanceInterval]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleResetZoom = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.zoomToRecent();
    }
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    const wrapper = chartWrapperRef.current;
    if (!wrapper) return;

    if (!document.fullscreenElement) {
      wrapper.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  const displayedCandle = hoveredCandle || (candles.length ? candles[candles.length - 1] : null);

  return (
    <div
      ref={chartWrapperRef}
      className="relative flex flex-col h-full w-full bg-theme-bg-base overflow-hidden"
    >
      {/* Global Workspace Notice Banner (if applicable) */}
      {isGlobal && (
        <div className="px-4 py-1 bg-theme-bg-elevated/80 border-b border-theme-border-subtle text-2xs text-theme-text-muted">
          {APP_CONTENT.chart.globalBenchmarkNotice}
        </div>
      )}

      {/* Main Chart Canvas Stage with Floating Overlays */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-theme-bg-base">
        {/* Floating Top-Left Dynamic Legend */}
        <div className="absolute top-3 left-4 z-10 pointer-events-none">
          <ChartLegend
            symbol={cleanSymbol}
            intervalLabel={activeTimeframe.label}
            candle={displayedCandle}
            precision={precision}
          />
        </div>

        {/* Floating Top-Right Action Controls (WS Status, Reset Zoom, Fullscreen) */}
        <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
          {/* Live WS Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-theme-bg-elevated/90 backdrop-blur-xs border border-theme-border-subtle text-2xs font-mono text-theme-text-muted select-none">
            <span
              className={`size-1.5 rounded-full ${
                wsStatus === 'connected'
                  ? 'bg-theme-positive-base animate-pulse'
                  : wsStatus === 'connecting'
                  ? 'bg-theme-brand-binance animate-ping'
                  : 'bg-theme-negative-base'
              }`}
            />
            <span>
              {wsStatus === 'connected'
                ? APP_CONTENT.chart.liveStreamBadge
                : wsStatus === 'connecting'
                ? APP_CONTENT.chart.connectingBadge
                : APP_CONTENT.chart.offlineBadge}
            </span>
          </div>

          {/* Reset Zoom Button */}
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={handleResetZoom}
            title={APP_CONTENT.chart.resetZoomTooltip}
            className="flex items-center gap-1 px-2.5 py-1 text-2xs rounded-lg bg-theme-bg-elevated/90 backdrop-blur-xs hover:bg-theme-bg-surface text-theme-text-secondary hover:text-theme-text-primary border border-theme-border-subtle transition-colors cursor-pointer select-none"
          >
            <RefreshCw className="size-3" />
            <span className="hidden sm:inline">{APP_CONTENT.chart.resetZoom}</span>
          </motion.button>

          {/* Fullscreen Toggle Button */}
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={handleToggleFullscreen}
            title={APP_CONTENT.chart.fullscreenTooltip}
            className="size-7 rounded-lg bg-theme-bg-elevated/90 backdrop-blur-xs hover:bg-theme-bg-surface text-theme-text-secondary hover:text-theme-text-primary border border-theme-border-subtle flex items-center justify-center transition-colors cursor-pointer select-none"
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </motion.button>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-theme-bg-base/70 backdrop-blur-2xs">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle shadow-lg text-xs font-mono text-theme-text-secondary">
              <span className="size-2 rounded-full bg-theme-brand-binance animate-ping" />
              <span>{APP_CONTENT.chart.loadingCandles}</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-theme-bg-base/80 p-4">
            <div className="p-4 rounded-xl bg-theme-bg-elevated border border-theme-negative-base/30 text-xs font-mono text-theme-negative-base text-center max-w-sm">
              {error}
            </div>
          </div>
        )}

        {/* Candlestick Canvas */}
        <CandlestickCanvas
          ref={canvasRef}
          candles={candles}
          precision={precision}
          onCrosshairMove={setHoveredCandle}
        />
      </div>
    </div>
  );
}
