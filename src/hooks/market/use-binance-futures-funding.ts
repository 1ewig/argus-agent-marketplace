'use client';

import { useState, useEffect, useRef, useSyncExternalStore, useMemo } from 'react';
import {
  buildFuturesMarkPriceStreamUrl,
  parseBinanceFuturesMarkPrice,
  parseBinanceFuturesRestPremiumIndex,
  type LiveFuturesFundingData,
  type StreamConnectionStatus,
  type BinanceRawMarkPriceMessage,
} from '@/lib/binance-websocket';

interface UseBinanceFuturesFundingOptions {
  enabled?: boolean;
}

export interface UseBinanceFuturesFundingReturn {
  data: LiveFuturesFundingData | null;
  status: StreamConnectionStatus;
  isAvailable: boolean;
  countdownFormatted: string;
}

const getIsTabVisible = () =>
  typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;

const subscribeVisibility = (callback: () => void) => {
  if (typeof document === 'undefined') return () => {};
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
};

function formatCountdown(targetEpochMs: number): string {
  if (!targetEpochMs || targetEpochMs <= 0) return '00:00:00';
  const diff = Math.max(0, targetEpochMs - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
}

/**
 * Hook to stream real-time Binance Futures mark price, funding rate, APR, and live settlement countdown.
 * Automatically sleeps during tab invisibility.
 */
export function useBinanceFuturesFunding(
  symbol: string,
  options: UseBinanceFuturesFundingOptions = {}
): UseBinanceFuturesFundingReturn {
  const { enabled = true } = options;

  const isTabVisible = useSyncExternalStore(subscribeVisibility, getIsTabVisible, () => true);
  const cleanSymbol = (symbol || '').trim().toUpperCase().replace(/[/\\_-]/g, '');
  const isGlobal = cleanSymbol === 'GLOBAL' || cleanSymbol === '';
  const isStreamActive = enabled && !isGlobal && isTabVisible;

  const [prevSymbol, setPrevSymbol] = useState(cleanSymbol);
  const [data, setData] = useState<LiveFuturesFundingData | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [internalStatus, setInternalStatus] = useState<StreamConnectionStatus>('connecting');
  const [tick, setTick] = useState(0);

  // Synchronize state when symbol changes during render
  if (prevSymbol !== cleanSymbol) {
    setPrevSymbol(cleanSymbol);
    setData(null);
    setIsAvailable(true);
    setInternalStatus('connecting');
  }

  const status: StreamConnectionStatus = !isStreamActive ? 'idle' : internalStatus;

  // Countdown timer ticking every second
  useEffect(() => {
    if (!isStreamActive || !data?.nextFundingTime) return;

    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isStreamActive, data?.nextFundingTime]);

  const countdownFormatted = useMemo(() => {
    // Reference tick so this re-computes every second
    void tick;
    return formatCountdown(data?.nextFundingTime ?? 0);
  }, [data?.nextFundingTime, tick]);

  // REST initial fetch + WebSocket live streaming
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isStreamActive) return;

    let isDisposed = false;
    let ws: WebSocket | null = null;
    const abortController = new AbortController();

    // 1. Initial REST fetch for instant display and availability check
    const fetchInitial = async () => {
      try {
        const res = await fetch(
          `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${cleanSymbol}`,
          { signal: abortController.signal }
        );

        if (isDisposed) return;

        if (!res.ok) {
          setIsAvailable(false);
          setInternalStatus('idle');
          return;
        }

        const json = await res.json();
        if (isDisposed) return;

        if (json?.code && json.code !== 200) {
          setIsAvailable(false);
          setInternalStatus('idle');
          return;
        }

        const parsed = parseBinanceFuturesRestPremiumIndex(json);
        setData(parsed);
        setIsAvailable(true);
      } catch (err: unknown) {
        if (isDisposed || (err instanceof DOMException && err.name === 'AbortError')) return;
        setIsAvailable(false);
      }
    };

    fetchInitial();

    // 2. WebSocket for sub-second mark price & funding updates
    const connectWs = () => {
      if (isDisposed) return;

      const wsUrl = buildFuturesMarkPriceStreamUrl(cleanSymbol);
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (isDisposed) {
            ws?.close();
            return;
          }
          setInternalStatus('connected');
        };

        ws.onmessage = (event: MessageEvent) => {
          if (isDisposed) return;
          try {
            const raw = JSON.parse(event.data as string) as BinanceRawMarkPriceMessage;
            if (raw.e === 'markPriceUpdate') {
              const parsed = parseBinanceFuturesMarkPrice(raw);
              setData(parsed);
              setIsAvailable(true);
            }
          } catch {
            // Silently ignore frame parse errors
          }
        };

        ws.onerror = () => {
          if (isDisposed) return;
          setInternalStatus('error');
        };

        ws.onclose = (event: CloseEvent) => {
          if (isDisposed || event.code === 1000) return;
          setInternalStatus('reconnecting');
          reconnectTimeoutRef.current = setTimeout(connectWs, 3000);
        };
      } catch {
        if (!isDisposed) setInternalStatus('error');
      }
    };

    connectWs();

    return () => {
      isDisposed = true;
      abortController.abort();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close(1000, 'Component unmounted');
        }
      }
    };
  }, [cleanSymbol, isStreamActive]);

  return {
    data,
    status,
    isAvailable,
    countdownFormatted,
  };
}
