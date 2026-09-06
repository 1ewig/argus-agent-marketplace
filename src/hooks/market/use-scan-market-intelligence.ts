'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { isGlobalSymbol } from '@/lib/utils';
import { marketIntelligenceQuery, fetchMarketIntelligence } from '@/lib/queries';
import { ONE_HOUR_MS } from '@/lib/db';
import { useMarketIntelligence } from './use-market-intelligence';
import type { MarketIntelligenceResponse } from '@/agent';

export interface UseScanMarketIntelligenceOptions {
  enabled?: boolean;
}

export interface UseScanMarketIntelligenceResult {
  cleanSymbol: string;
  isScanning: boolean;
  isAnalyzing: boolean;
  isAnalysisFresh: boolean;
  handleScan: () => Promise<void>;
  intelligenceResponse: MarketIntelligenceResponse | undefined;
}

/**
 * Hook to manage scanning, manual refresh mutations, and freshness derivation
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

  // Tick every 10 seconds so fresh/stale state updates reactively when analysis hits the 1-hour threshold
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  const { response: intelligenceResponse } = useMarketIntelligence(cleanSymbol, {
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
    isScanning,
    isAnalyzing,
    isAnalysisFresh,
    handleScan,
    intelligenceResponse,
  };
}
