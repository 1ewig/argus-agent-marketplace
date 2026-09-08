'use client';

import {
  useBinanceFuturesFunding,
  useGlobalMarketOverview,
} from '@/hooks';
import { useAppStore } from '@/stores/app-store';

export interface UseMarketPanelDataOptions {
  symbol: string;
  isGlobal: boolean;
  isOpen: boolean;
}

/**
 * Custom reactive hook bundling live telemetry streams and global macro overview queries
 * for MarketPanel presentation components.
 */
export function useMarketPanelData({
  symbol,
  isGlobal,
  isOpen,
}: UseMarketPanelDataOptions) {
  const rightPanelTab = useAppStore((state) => state.rightPanelTab);
  const setRightPanelTab = useAppStore((state) => state.setRightPanelTab);
  const toggleMarketPanel = useAppStore((state) => state.toggleMarketPanel);

  // 1. Global Market Overview hook (active on GLOBAL workspace)
  const global = useGlobalMarketOverview({
    enabled: isOpen && isGlobal,
  });

  // 2. Real-time Binance Futures WebSocket / Funding stream
  const futures = useBinanceFuturesFunding(symbol, {
    enabled: isOpen && !isGlobal,
  });

  return {
    rightPanelTab,
    setRightPanelTab,
    toggleMarketPanel,
    global,
    futures,
  };
}
