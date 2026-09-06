'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { isGlobalSymbol } from '@/lib/utils';
import { marketIntelligenceQuery, fetchMarketIntelligence } from '@/lib/queries';
import { ONE_HOUR_MS } from '@/lib/db';
import { useMarketIntelligence } from './use-market-intelligence';
import type { MarketIntelligencePayload, MarketIntelligenceResponse } from '@/agent';

export interface UseScanMarketIntelligenceOptions {
  enabled?: boolean;
}

export interface UseScanMarketIntelligenceResult {
  cleanSymbol: string;
  response: MarketIntelligenceResponse | undefined;
  data: MarketIntelligencePayload | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isScanning: boolean;
  isAnalyzing: boolean;
  isAnalysisFresh: boolean;
  nextRunCountdown: string | null;
  nextRunTimestamp: number | null;
  handleScan: () => Promise<void>;
  intelligenceResponse: MarketIntelligenceResponse | undefined;
}

/**
 * Hook to manage scanning, manual refresh mutations, data retrieval, and freshness derivation
 * for symbol-specific Market Intelligence.
 */
export function useScanMarketIntelligence(
  symbol: string,
  options: UseScanMarketIntelligenceOptions = {}
): UseScanMarketIntelligenceResult {
  const { enabled = true } = options;
  const cleanSymbol = useMemo(() => symbol.trim().toUpperCase(), [symbol]);
  const isGlobal = isGlobalSymbol(cleanSymbol);
  const queryClient = useQueryClient();

  const [isScanning, setIsScanning] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Tick every 1 second when active so countdown and freshness state update in real-time
  useEffect(() => {
    if (!enabled || isGlobal) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [enabled, isGlobal]);

  const {
    response: intelligenceResponse,
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useMarketIntelligence(cleanSymbol, {
    enabled: enabled && !isGlobal,
  });

  const isFetchingIntelligence = useIsFetching({
    queryKey: marketIntelligenceQuery.detail(cleanSymbol),
  }) > 0;

  const isAnalyzing = isScanning || isFetchingIntelligence;

  // Analysis is fresh if it exists and was conducted less than 1 hour ago
  const isAnalysisFresh = Boolean(
    intelligenceResponse?.timestamp && now - intelligenceResponse.timestamp < ONE_HOUR_MS
  );

  const nextRunTimestamp = useMemo(() => {
    if (!intelligenceResponse?.timestamp) return null;
    return intelligenceResponse.timestamp + ONE_HOUR_MS;
  }, [intelligenceResponse?.timestamp]);

  const nextRunCountdown = useMemo(() => {
    if (!nextRunTimestamp || !isAnalysisFresh) return null;
    const diff = Math.max(0, nextRunTimestamp - now);
    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [nextRunTimestamp, isAnalysisFresh, now]);

  const handleScan = useCallback(async () => {
    if (isAnalyzing || isGlobal) return;
    setIsScanning(true);
    try {
      const freshData = await fetchMarketIntelligence(cleanSymbol, { force: true });
      queryClient.setQueryData(marketIntelligenceQuery.detail(cleanSymbol), freshData);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Argus:MarketIntelligence] Scan failed:', err);
      }
    } finally {
      setIsScanning(false);
    }
  }, [isAnalyzing, isGlobal, cleanSymbol, queryClient]);

  return {
    cleanSymbol,
    response: intelligenceResponse,
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isScanning,
    isAnalyzing,
    isAnalysisFresh,
    nextRunCountdown,
    nextRunTimestamp,
    handleScan,
    intelligenceResponse,
  };
}
