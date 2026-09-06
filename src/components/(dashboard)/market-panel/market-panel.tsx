'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Loader2, Bot, Activity, RefreshCw } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { useQueryClient } from '@tanstack/react-query';
import { sidebarSpringTransition, tapScalePill } from '@/constants/animation';
import { useBinanceMarketStream } from '@/hooks/use-binance-market-stream';
import { useAppStore } from '@/stores/app-store';
import {
  PriceTickerCard,
  FuturesFundingCard,
  OrderBookDepthCard,
} from './telemetry';
import {
  MarketIntelligenceAgentView,
  getStoredIntelligence,
  useIsFresh,
  ONE_HOUR_MS,
} from './agents';
import type { MarketIntelligenceResponse } from '@/agent';

interface MarketPanelProps {
  isOpen: boolean;
  symbol: string;
  isGlobal: boolean;
}

export function MarketPanel({ isOpen, symbol, isGlobal }: MarketPanelProps) {
  const content = APP_CONTENT.marketPanel;
  const intelligence = APP_CONTENT.marketIntelligence;
  const rightPanelTab = useAppStore((state) => state.rightPanelTab);
  const setRightPanelTab = useAppStore((state) => state.setRightPanelTab);
  const queryClient = useQueryClient();

  const [isScanning, setIsScanning] = useState(false);
  const [scanKey, setScanKey] = useState(0);

  const cleanSymbol = symbol.trim().toUpperCase();

  // Check if market intelligence for this coin was analyzed within the past 1 hour
  const cachedIntelligence =
    queryClient.getQueryData<MarketIntelligenceResponse>([
      'market-intelligence',
      cleanSymbol,
    ]) ?? (typeof window !== 'undefined' ? getStoredIntelligence(cleanSymbol) : null);

  const isIntelligenceFresh = useIsFresh(cachedIntelligence?.timestamp, ONE_HOUR_MS);

  const handleScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ['market-intelligence', cleanSymbol],
      });
      setScanKey((k) => k + 1);
    } finally {
      setIsScanning(false);
    }
  };

  // Real-time client-direct Binance WebSocket connection
  const { ticker, orderBook, status } = useBinanceMarketStream(symbol, {
    enabled: isOpen && !isGlobal,
    depthLevels: 8,
  });

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? '40%' : '0%',
        opacity: isOpen ? 1 : 0,
      }}
      transition={sidebarSpringTransition}
      className="h-full bg-theme-bg-surface border-l border-theme-border-subtle flex flex-col shrink-0 select-none z-20 overflow-hidden relative will-change-[width,opacity]"
      aria-label={content.title}
    >
      <div className="w-full min-w-[340px] h-full flex flex-col overflow-hidden">
        {/* Panel Header with Multi-Tab Switcher & Action Controls */}
        <div className="h-14 px-3 sm:px-4 flex items-center justify-between border-b border-theme-border-subtle shrink-0 gap-2">
          {/* Tabs Segmented Control */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-theme-bg-elevated/70 border border-theme-border-subtle/80">
            {/* Tab 1: Live Telemetry Overview */}
            <motion.button
              type="button"
              whileTap={tapScalePill}
              onClick={() => setRightPanelTab('overview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                rightPanelTab === 'overview'
                  ? 'bg-theme-bg-surface text-theme-text-primary shadow-2xs'
                  : 'text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              <Activity className="size-3 text-theme-brand-binance" />
              <span>{content.tabs.overview}</span>
            </motion.button>

            {/* Tab 2: Market Intelligence Agent */}
            <motion.button
              type="button"
              whileTap={tapScalePill}
              onClick={() => setRightPanelTab('intelligence')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                rightPanelTab === 'intelligence' || rightPanelTab === 'market-data'
                  ? 'bg-theme-bg-surface text-theme-text-primary shadow-2xs'
                  : 'text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              <Bot className="size-3 text-theme-brand-binance" />
              <span>{content.tabs.intelligence}</span>
            </motion.button>
          </div>

          {/* Connection Status Badge (only shown during connecting, reconnecting, or error in overview) */}
          {!isGlobal && rightPanelTab === 'overview' && status !== 'connected' && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors shrink-0 ${
                status === 'connecting' || status === 'reconnecting'
                  ? 'bg-theme-brand-binance/10 border-theme-brand-binance/30 text-theme-brand-binance'
                  : 'bg-theme-status-danger/10 border-theme-status-danger/30 text-theme-status-danger'
              }`}
            >
              {status === 'connecting' || status === 'reconnecting' ? (
                <Loader2 className="size-2.5 animate-spin" />
              ) : (
                <span className="size-1.5 rounded-full bg-theme-status-danger" />
              )}
              <span className="text-[10px] font-mono font-bold tracking-tight">
                {status === 'connecting'
                  ? content.statusConnecting
                  : status === 'reconnecting'
                  ? content.statusReconnecting
                  : content.statusError}
              </span>
            </div>
          )}

          {/* Header Action in Intelligence Tab: Scan Market Button (Removed for 1 hour once cached) */}
          {!isGlobal &&
            (rightPanelTab === 'intelligence' || rightPanelTab === 'market-data') &&
            !isIntelligenceFresh && (
              <motion.button
                type="button"
                whileTap={tapScalePill}
                onClick={handleScan}
                disabled={isScanning}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 active:bg-theme-bg-surface border border-theme-border-subtle text-theme-text-primary transition-colors cursor-pointer disabled:opacity-50 shadow-2xs shrink-0"
              >
                <RefreshCw className={`size-3 text-theme-brand-binance ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? intelligence.refreshing : intelligence.refreshButton}</span>
              </motion.button>
          )}
        </div>

        {/* Scrollable Panel Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-4 flex flex-col gap-3.5 sm:gap-4">
          {isGlobal ? (
            <div className="flex flex-col items-center justify-center text-center p-6 rounded-xl bg-theme-bg-elevated/40 border border-theme-border-subtle/80 my-auto">
              <div className="size-10 rounded-xl bg-theme-bg-surface border border-theme-border-subtle flex items-center justify-center mb-3 shadow-2xs">
                <Globe className="size-5 text-theme-brand-binance" />
              </div>
              <h4 className="text-sm font-bold text-theme-text-primary mb-1">
                {content.globalTitle}
              </h4>
              <p className="text-xs text-theme-text-secondary leading-relaxed max-w-xs">
                {content.globalEmptyNotice}
              </p>
            </div>
          ) : rightPanelTab === 'intelligence' || rightPanelTab === 'market-data' ? (
            <MarketIntelligenceAgentView key={`intelligence_${symbol}_${scanKey}`} symbol={symbol} />
          ) : (
            <>
              {/* Module 1: Price & 24h Ticker Pulse with Micro Sparkline */}
              <PriceTickerCard
                key={`ticker_${symbol}`}
                symbol={symbol}
                ticker={ticker}
                status={status}
              />

              {/* Module 2: Perpetual Futures Sentinel (Funding Rate & Countdown) */}
              <FuturesFundingCard
                key={`futures_${symbol}`}
                symbol={symbol}
                isOpen={isOpen}
              />

              {/* Module 3: Micro Order Book Depth Ladder */}
              <OrderBookDepthCard
                key={`depth_${symbol}`}
                symbol={symbol}
                orderBook={orderBook}
                status={status}
              />

              {/* Verified Stream Notice */}
              <div className="text-[10px] font-mono text-center text-theme-text-muted/70 py-1 select-none">
                {content.mockupNotice}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
