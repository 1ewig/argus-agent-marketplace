'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Loader2, Bot, Activity, RefreshCw, Clock } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { sidebarSpringTransition, tapScalePill } from '@/constants/animation';
import {
  useBinanceMarketStream,
  useBinanceFuturesFunding,
  useScanMarketIntelligence,
  useGlobalMarketOverview,
} from '@/hooks';
import { useAppStore, isIntelligenceTabActive } from '@/stores/app-store';
import {
  PriceTickerCard,
  FuturesFundingCard,
  OrderBookDepthCard,
} from './telemetry';
import { MarketIntelligenceAgentView } from './agents';
import { GlobalMarketView } from './global';

interface MarketPanelProps {
  isOpen: boolean;
  symbol: string;
  isGlobal: boolean;
}

export function MarketPanel({ isOpen, symbol, isGlobal }: MarketPanelProps) {
  const content = APP_CONTENT.marketPanel;
  const globalContent = APP_CONTENT.globalMarket;
  const intelligence = APP_CONTENT.marketIntelligence;
  const rightPanelTab = useAppStore((state) => state.rightPanelTab);
  const setRightPanelTab = useAppStore((state) => state.setRightPanelTab);

  // Global Market Overview hook (active when on GLOBAL workspace)
  const {
    data: globalData,
    isLoading: isGlobalLoading,
    isFetching: isGlobalFetching,
    isRefreshing: isGlobalRefreshing,
    isError: isGlobalError,
    handleRefresh: handleRefreshGlobal,
  } = useGlobalMarketOverview({
    enabled: isOpen && isGlobal,
  });

  // Market Intelligence Scan & Data hook (active for symbol workspaces when tab is opened)
  const isIntelligenceActive = isIntelligenceTabActive(rightPanelTab);
  const {
    cleanSymbol,
    data: intelligenceData,
    isLoading: isIntelligenceLoading,
    isFetching: isIntelligenceFetching,
    isError: isIntelligenceError,
    refetch: refetchIntelligence,
    isAnalyzing,
    isAnalysisFresh,
    nextRunCountdown,
    handleScan,
  } = useScanMarketIntelligence(symbol, {
    enabled: isOpen && !isGlobal && isIntelligenceActive,
  });

  // Real-time client-direct Binance Spot WebSocket connection
  const { ticker, orderBook, status: spotStatus } = useBinanceMarketStream(symbol, {
    enabled: isOpen && !isGlobal,
    depthLevels: 8,
  });

  // Real-time Binance Futures WebSocket / Funding stream
  const {
    data: futuresData,
    isAvailable: isFuturesAvailable,
    countdownFormatted: futuresCountdownFormatted,
  } = useBinanceFuturesFunding(symbol, {
    enabled: isOpen && !isGlobal,
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
        {/* Panel Header */}
        <div className="h-14 px-3 sm:px-4 flex items-center justify-between border-b border-theme-border-subtle shrink-0 gap-2">
          {isGlobal ? (
            /* Dedicated Header for Global Workspace: Single Overview Title & Refresh */
            <>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-theme-bg-elevated/70 border border-theme-border-subtle/80">
                  <Globe className="size-3.5 text-theme-brand-binance" />
                  <span className="text-xs font-bold text-theme-text-primary">
                    {globalContent.headerTitle}
                  </span>
                  <span className="text-2xs font-mono font-bold text-theme-brand-binance bg-theme-brand-binance/10 border border-theme-brand-binance/25 px-1.5 py-0.5 rounded">
                    {globalContent.headerBadge}
                  </span>
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={isGlobalFetching || isGlobalRefreshing ? undefined : tapScalePill}
                onClick={() => handleRefreshGlobal()}
                disabled={isGlobalFetching || isGlobalRefreshing}
                aria-label={isGlobalFetching || isGlobalRefreshing ? globalContent.refreshing : globalContent.refreshButton}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 active:bg-theme-bg-surface border border-theme-border-subtle text-theme-text-primary transition-colors cursor-pointer disabled:opacity-50 shadow-2xs shrink-0"
              >
                <RefreshCw className={`size-3 text-theme-brand-binance ${isGlobalFetching || isGlobalRefreshing ? 'animate-spin' : ''}`} />
                <span>{isGlobalFetching || isGlobalRefreshing ? globalContent.refreshing : globalContent.refreshButton}</span>
              </motion.button>
            </>
          ) : (
            /* Symbol Workspace Header: Segmented Tabs & Action Controls */
            <>
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
                    isIntelligenceTabActive(rightPanelTab)
                      ? 'bg-theme-bg-surface text-theme-text-primary shadow-2xs'
                      : 'text-theme-text-secondary hover:text-theme-text-primary'
                  }`}
                >
                  <Bot className="size-3 text-theme-brand-binance" />
                  <span>{content.tabs.intelligence}</span>
                </motion.button>
              </div>

              {/* Connection Status Badge in Telemetry View */}
              {rightPanelTab === 'overview' && spotStatus !== 'connected' && (
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors shrink-0 ${
                    spotStatus === 'connecting' || spotStatus === 'reconnecting'
                      ? 'bg-theme-brand-binance/10 border-theme-brand-binance/30 text-theme-brand-binance'
                      : 'bg-theme-status-danger/10 border-theme-status-danger/30 text-theme-status-danger'
                  }`}
                >
                  {spotStatus === 'connecting' || spotStatus === 'reconnecting' ? (
                    <Loader2 className="size-2.5 animate-spin" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-theme-status-danger" />
                  )}
                  <span className="text-[10px] font-mono font-bold tracking-tight">
                    {spotStatus === 'connecting'
                      ? content.statusConnecting
                      : spotStatus === 'reconnecting'
                      ? content.statusReconnecting
                      : content.statusError}
                  </span>
                </div>
              )}

              {/* Action Controls in Intelligence Tab */}
              {isIntelligenceTabActive(rightPanelTab) && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {isAnalyzing ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-theme-bg-elevated text-theme-text-secondary border border-theme-border-subtle shadow-2xs">
                      <RefreshCw className="size-3 text-theme-brand-binance animate-spin shrink-0" />
                      <span>{intelligence.refreshing}</span>
                    </div>
                  ) : isAnalysisFresh && nextRunCountdown ? (
                    <div
                      title={intelligence.nextRunTooltip}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-theme-bg-elevated/80 border border-theme-border-subtle text-theme-text-secondary select-none shadow-2xs"
                    >
                      <Clock className="size-3 text-theme-brand-binance shrink-0" />
                      <span className="text-theme-text-muted text-[11px] font-sans font-semibold uppercase tracking-wider">
                        {intelligence.nextRunPrefix}
                      </span>
                      <span className="text-theme-text-primary">{nextRunCountdown}</span>
                    </div>
                  ) : (
                    <motion.button
                      type="button"
                      whileTap={tapScalePill}
                      onClick={handleScan}
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 active:bg-theme-bg-surface border border-theme-border-subtle text-theme-text-primary transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <RefreshCw className={`size-3 text-theme-brand-binance ${isAnalyzing ? 'animate-spin' : ''}`} />
                      <span>{intelligence.refreshButton}</span>
                    </motion.button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Scrollable Panel Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-4 flex flex-col gap-3.5 sm:gap-4">
          {isGlobal ? (
            /* 4-Card Global Market View */
            <GlobalMarketView
              data={globalData}
              isLoading={isGlobalLoading}
              isFetching={isGlobalFetching || isGlobalRefreshing}
              isError={isGlobalError}
              onRetry={handleRefreshGlobal}
            />
          ) : isIntelligenceTabActive(rightPanelTab) ? (
            /* Symbol Market Intelligence Agent View */
            <MarketIntelligenceAgentView
              key={`intelligence_${cleanSymbol}`}
              data={intelligenceData}
              isLoading={isIntelligenceLoading}
              isFetching={isIntelligenceFetching}
              isError={isIntelligenceError}
              onRetry={refetchIntelligence}
            />
          ) : (
            /* Symbol Live Telemetry View */
            <>
              {/* Module 1: Price & 24h Ticker Pulse with Micro Sparkline */}
              <PriceTickerCard
                key={`ticker_${symbol}`}
                symbol={symbol}
                ticker={ticker}
                status={spotStatus}
              />

              {/* Module 2: Perpetual Futures Sentinel (Funding Rate & Countdown) */}
              <FuturesFundingCard
                key={`futures_${symbol}`}
                data={futuresData}
                isAvailable={isFuturesAvailable}
                countdownFormatted={futuresCountdownFormatted}
              />

              {/* Module 3: Micro Order Book Depth Ladder */}
              <OrderBookDepthCard
                key={`depth_${symbol}`}
                symbol={symbol}
                orderBook={orderBook}
                status={spotStatus}
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
