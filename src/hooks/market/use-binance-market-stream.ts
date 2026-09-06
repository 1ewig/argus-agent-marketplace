'use client';

import { useState, useEffect, useRef } from 'react';
import { isGlobalSymbol } from '@/lib/utils';
import { normalizeSymbolForDisplay } from '@/lib/symbols';
import { useTabVisibility } from '@/hooks/ui';
import {
  buildCombinedStreamUrl,
  parseBinanceTickerMessage,
  parseBinanceDepthMessage,
  type LiveTickerData,
  type LiveOrderBookData,
  type StreamConnectionStatus,
  type BinanceCombinedStreamMessage,
  type BinanceRawTickerMessage,
  type BinanceRawDepthMessage,
} from '@/lib/binance-websocket';

interface UseBinanceMarketStreamOptions {
  enabled?: boolean;
  depthLevels?: number;
}

export interface UseBinanceMarketStreamReturn {
  ticker: LiveTickerData | null;
  orderBook: LiveOrderBookData | null;
  status: StreamConnectionStatus;
  symbol: string;
}

/**
 * Custom hook connecting directly to Binance public WebSocket combined streams
 * Subscribes to <symbol>@ticker (1000ms) and <symbol>@depth10@100ms (100ms)
 * Automatically sleeps when the browser tab is hidden to save battery and network bandwidth.
 */
export function useBinanceMarketStream(
  symbol: string,
  options: UseBinanceMarketStreamOptions = {}
): UseBinanceMarketStreamReturn {
  const { enabled = true, depthLevels = 8 } = options;

  const isTabVisible = useTabVisibility();

  const cleanSymbol = normalizeSymbolForDisplay(symbol);
  const isGlobal = isGlobalSymbol(cleanSymbol);
  const isStreamActive = enabled && !isGlobal && isTabVisible;

  const [prevSymbol, setPrevSymbol] = useState(cleanSymbol);
  const [ticker, setTicker] = useState<LiveTickerData | null>(null);
  const [orderBook, setOrderBook] = useState<LiveOrderBookData | null>(null);
  const [internalStatus, setInternalStatus] = useState<StreamConnectionStatus>('connecting');

  // Synchronize state when symbol switches during render
  if (prevSymbol !== cleanSymbol) {
    setPrevSymbol(cleanSymbol);
    setTicker(null);
    setOrderBook(null);
    setInternalStatus('connecting');
  }

  const status: StreamConnectionStatus = !isStreamActive ? 'idle' : internalStatus;

  const prevPriceRef = useRef<number | undefined>(undefined);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    // When disabled, on Global workspace, or tab is hidden, do not maintain active socket
    if (!isStreamActive) {
      return;
    }

    let isDisposed = false;
    let ws: WebSocket | null = null;
    let rafId: number | null = null;
    let pendingDepth: LiveOrderBookData | null = null;
    prevPriceRef.current = undefined;

    const connect = () => {
      if (isDisposed) return;

      const url = buildCombinedStreamUrl(cleanSymbol);
      setInternalStatus(retryCountRef.current > 0 ? 'reconnecting' : 'connecting');

      try {
        ws = new WebSocket(url);

        ws.onopen = () => {
          if (isDisposed) {
            ws?.close();
            return;
          }
          setInternalStatus('connected');
          retryCountRef.current = 0;
        };

        ws.onmessage = (event: MessageEvent) => {
          if (isDisposed) return;

          try {
            const parsed = JSON.parse(event.data as string) as BinanceCombinedStreamMessage;
            if (!parsed?.stream || !parsed?.data) return;

            if (parsed.stream.endsWith('@ticker')) {
              const rawTicker = parsed.data as BinanceRawTickerMessage;
              const nextTicker = parseBinanceTickerMessage(rawTicker, prevPriceRef.current);
              prevPriceRef.current = nextTicker.price;
              setTicker(nextTicker);

              // Auto-reset the visual flash direction after 700ms
              if (nextTicker.flashDirection) {
                if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
                flashTimeoutRef.current = setTimeout(() => {
                  if (!isDisposed) {
                    setTicker((prev) => (prev ? { ...prev, flashDirection: null } : null));
                  }
                }, 700);
              }
            } else if (parsed.stream.includes('@depth')) {
              const rawDepth = parsed.data as BinanceRawDepthMessage;
              pendingDepth = parseBinanceDepthMessage(cleanSymbol, rawDepth, depthLevels);

              if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                  rafId = null;
                  if (!isDisposed && pendingDepth) {
                    setOrderBook(pendingDepth);
                  }
                });
              }
            }
          } catch {
            // Silently swallow malformed JSON frames from stream
          }
        };

        ws.onerror = () => {
          if (isDisposed) return;
          setInternalStatus('error');
        };

        ws.onclose = (event: CloseEvent) => {
          if (isDisposed) return;

          // Normal intentional closures (code 1000) don't trigger reconnect
          if (event.code === 1000) {
            setInternalStatus('idle');
            return;
          }

          setInternalStatus('reconnecting');
          const delay = Math.min(1000 * 1.5 ** retryCountRef.current, 10000);
          retryCountRef.current += 1;

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        };
      } catch {
        if (!isDisposed) {
          setInternalStatus('error');
        }
      }
    };

    connect();

    return () => {
      isDisposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close(1000, 'Symbol changed or component unmounted');
        }
        ws = null;
      }
    };
  }, [cleanSymbol, isStreamActive, depthLevels]);

  return {
    ticker,
    orderBook,
    status,
    symbol: cleanSymbol,
  };
}
