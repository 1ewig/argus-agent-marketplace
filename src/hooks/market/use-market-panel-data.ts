'use client';

import {
  useBinanceFuturesFunding,
  useScanMarketIntelligence,
  useGlobalMarketOverview,
} from '@/hooks';
import { useAppStore, isIntelligenceTabActive } from '@/stores/app-store';

export interface UseMarketPanelDataOptions {
  symbol: string;
  isGlobal: boolean;
  isOpen: boolean;
}

/**
 * Custom reactive hook bundling live telemetry streams, market intelligence scans,
 * and global macro overview queries for MarketPanel presentation components.
 */
export function useMarketPanelData({
  symbol,
  isGlobal,
  isOpen,
}: UseMarketPanelDataOptions) {
  const rightPanelTab = useAppStore((state) => state.rightPanelTab);
  const setRightPanelTab = useAppStore((state) => state.setRightPanelTab);
  const toggleMarketPanel = useAppStore((state) => state.toggleMarketPanel);

  const isIntelligenceActive = isIntelligenceTabActive(rightPanelTab);

  // 1. Global Market Overview hook (active on GLOBAL workspace)
  const global = useGlobalMarketOverview({
    enabled: isOpen && isGlobal,
  });

  // 2. Market Intelligence Scan & Data hook (active for symbol workspaces when tab is opened)
  const intelligence = useScanMarketIntelligence(symbol, {
    enabled: isOpen && !isGlobal && isIntelligenceActive,
  });

  // 3. Real-time Binance Futures WebSocket / Funding stream
  const futures = useBinanceFuturesFunding(symbol, {
    enabled: isOpen && !isGlobal,
  });

  return {
    rightPanelTab,
    setRightPanelTab,
    toggleMarketPanel,
    isIntelligenceActive,
    global,
    intelligence,
    futures,
  };
}
