'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, LineChart } from 'lucide-react';
import { useBinanceMarketStream, useChatSessions } from '@/hooks';
import { isGlobalSymbol, normalizeSymbolForDisplay } from '@/lib/utils';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import { useAppStore } from '@/stores/app-store';
import { DashboardHeader } from './dashboard-header';
import { MarketPanel } from './market-panel';
import { ChatClient } from './chat';
import { ChartClient } from './chart';
import type { ExecutionMode } from '@/lib/types';

interface DashboardClientProps {
  mode?: ExecutionMode;
}

/**
 * Main orchestrator for the dashboard stage layout, header controls, and stage switching.
 * Pure layout shell that isolates ChatClient and ChartClient sub-trees from cascade renders.
 */
export function DashboardClient({ mode = 'simulation' }: DashboardClientProps) {
  // Global application UI state
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const stageView = useAppStore((state) => state.stageView);
  const setStageView = useAppStore((state) => state.setStageView);
  const chartTimeframe = useAppStore((state) => state.chartTimeframe);
  const setChartTimeframe = useAppStore((state) => state.setChartTimeframe);
  const isMarketPanelOpen = useAppStore((state) => state.isMarketPanelOpen);
  const rightPanelTab = useAppStore((state) => state.rightPanelTab);
  const toggleMarketPanel = useAppStore((state) => state.toggleMarketPanel);
  const toggleMobileSidebar = useAppStore((state) => state.toggleMobileSidebar);
  const setIsSymbolSearchOpen = useAppStore((state) => state.setIsSymbolSearchOpen);

  // Symbol domain parsing
  const cleanSymbol = normalizeSymbolForDisplay(selectedSymbol) || 'BTCUSDT';
  const isGlobalWorkspace = isGlobalSymbol(cleanSymbol);

  // Shared real-time client-direct Binance Spot WebSocket connection (powers chart header + telemetry cards)
  const isSpotStreamActive =
    !isGlobalWorkspace &&
    (stageView === 'chart' || (isMarketPanelOpen && rightPanelTab === 'overview'));

  const { ticker, orderBook, status: spotStatus } = useBinanceMarketStream(cleanSymbol, {
    enabled: isSpotStreamActive,
    depthLevels: 8,
  });

  // Session management for DashboardHeader and mobile FAB positioning
  const { isNewChatDisabled, handleNewSession, activeMessageCount } = useChatSessions();
  const hasBottomDock = activeMessageCount > 0;

  // Header interaction handlers
  const handleOpenSymbolSearch = useCallback(() => {
    setIsSymbolSearchOpen(true);
  }, [setIsSymbolSearchOpen]);

  const handleNewChat = useCallback(() => {
    handleNewSession();
  }, [handleNewSession]);

  const handleToggleStageView = useCallback(() => {
    setStageView(stageView === 'agent' ? 'chart' : 'agent');
  }, [stageView, setStageView]);

  return (
    <div className="relative flex flex-col h-full w-full bg-theme-bg-base overflow-hidden">
      {/* 1. Header Toolbar with Workspace Selector, Live Price/24h Stats, Timeframe Switcher, Agent/Chart Toggle, New Chat & Panel Toggles */}
      <DashboardHeader
        symbol={cleanSymbol}
        isGlobal={isGlobalWorkspace}
        stageView={stageView}
        chartTimeframe={chartTimeframe}
        ticker={ticker}
        isNewChatDisabled={isNewChatDisabled}
        isMarketPanelOpen={isMarketPanelOpen}
        onToggleMobileSidebar={toggleMobileSidebar}
        onOpenSymbolSearch={handleOpenSymbolSearch}
        onToggleStageView={handleToggleStageView}
        onSelectChartTimeframe={setChartTimeframe}
        onNewChat={handleNewChat}
        onToggleMarketPanel={toggleMarketPanel}
      />

      {/* 2. Main Stage Body: Horizontal Flex (Chat Column / Chart Column + Right Market Panel) */}
      <div className="relative flex-1 min-h-0 w-full flex flex-row overflow-hidden">
        {/* Central Stage: Agent Chat View (Zero-flash hidden when stageView === 'chart') */}
        <div
          className={`relative flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden ${
            stageView === 'agent' ? 'flex' : 'hidden'
          }`}
        >
          <ChatClient mode={mode} />
        </div>

        {/* Central Stage: Trading Chart View (Zero-flash hidden when stageView === 'agent') */}
        <div
          className={`relative flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden ${
            stageView === 'chart' ? 'flex' : 'hidden'
          }`}
        >
          <ChartClient symbol={cleanSymbol} />
        </div>

        {/* Right Collapsible Market Overview Panel */}
        <MarketPanel
          isOpen={isMarketPanelOpen}
          symbol={cleanSymbol}
          isGlobal={isGlobalWorkspace}
          ticker={ticker}
          orderBook={orderBook}
          spotStatus={spotStatus}
        />
      </div>

      {/* Mobile Floating Action Button (FAB) on Bottom Right: Quick toggle between Agent & Chart */}
      <AnimatePresence mode="wait">
        <motion.button
          key={`mobile-stage-fab-${stageView}`}
          type="button"
          whileTap={tapScalePill}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          onClick={handleToggleStageView}
          title={
            stageView === 'agent'
              ? APP_CONTENT.chart.switchToChart
              : APP_CONTENT.chart.switchToAgent
          }
          aria-label={
            stageView === 'agent'
              ? APP_CONTENT.chart.switchToChart
              : APP_CONTENT.chart.switchToAgent
          }
          className={`md:hidden fixed z-40 size-12 rounded-full bg-theme-brand-binance text-theme-bg-overlay shadow-xl shadow-black/40 flex items-center justify-center cursor-pointer border border-theme-brand-binance/50 hover:brightness-110 active:scale-95 transition-all select-none ${
            stageView === 'agent' && hasBottomDock
              ? 'bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] right-4'
              : 'bottom-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] right-4'
          }`}
        >
          {stageView === 'agent' ? (
            <LineChart className="size-5.5 stroke-[2.25]" />
          ) : (
            <Bot className="size-6 stroke-[2.25]" />
          )}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}
