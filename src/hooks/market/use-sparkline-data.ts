import { useState, useEffect, useMemo, useRef } from 'react';
import { isGlobalSymbol } from '@/lib/utils';
import { normalizeSymbolForDisplay } from '@/lib/symbols';

export interface UseSparklineDataResult {
  points: number[];
  isLoading: boolean;
  error: boolean;
  cleanSymbol: string;
}

/**
 * Hook to manage sparkline price data for a trading symbol:
 * - Fetches the initial 30 1-minute historical klines from Binance public REST API.
 * - Handles real-time candle rollover and tick updates within 30-point sliding window.
 */
export function useSparklineData(
  symbol: string,
  currentPrice?: number
): UseSparklineDataResult {
  const cleanSymbol = useMemo(
    () => normalizeSymbolForDisplay(symbol),
    [symbol]
  );

  const [points, setPoints] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(() => !isGlobalSymbol(cleanSymbol));
  const [error, setError] = useState(false);

  // Keep track of the current minute bucket so the sparkline slides forward
  const currentBucketMinuteRef = useRef<number>(0);
  const lastPriceRef = useRef<number | undefined>(undefined);

  // 1. Fetch initial 30 1-minute klines
  useEffect(() => {
    if (isGlobalSymbol(cleanSymbol)) {
      return;
    }

    let isSubscribed = true;
    const abortController = new AbortController();

    const fetchKlines = async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=1m&limit=30`,
          { signal: abortController.signal }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as Array<[number, string, string, string, string, ...unknown[]]>;
        if (!isSubscribed || !Array.isArray(data)) return;

        // candle[4] = close price, candle[0] = open time
        const closes: number[] = [];
        let lastCandleTime = 0;

        for (const candle of data) {
          const close = Number.parseFloat(candle[4]);
          if (Number.isFinite(close) && close > 0) {
            closes.push(close);
            lastCandleTime = Number(candle[0]);
          }
        }

        if (isSubscribed) {
          if (lastCandleTime > 0) {
            currentBucketMinuteRef.current = Math.floor(lastCandleTime / 60000);
          }
          setPoints(closes);
          setError(false);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!isSubscribed || (err instanceof DOMException && err.name === 'AbortError')) return;
        setError(true);
        setIsLoading(false);
      }
    };

    fetchKlines();

    return () => {
      isSubscribed = false;
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

  return {
    points,
    isLoading,
    error,
    cleanSymbol,
  };
}
