'use client';

import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, LineChart } from 'lucide-react';
import { useAgentChat, useBinanceMarketStream } from '@/hooks';
import { isGlobalSymbol, normalizeSymbolForDisplay } from '@/lib/utils';
import { parseSymbolAssets } from '@/lib/symbols';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import { useAppStore } from '@/stores/app-store';
import { DashboardHeader } from './dashboard-header';
import { MarketPanel } from './market-panel';
import { ChatEmptyState, ChatMessageList, ChatDock, type QuickActionItem } from './chat';
import { ChartClient } from './chart';
import type { ExecutionMode } from '@/lib/types';

interface DashboardClientProps {
  mode?: ExecutionMode;
}

/**
 * Main orchestrator for the dashboard stage, chat feed, chart telemetry, and header controls.
 * Connects directly to stores and chat hooks, driving pure presentation components via props.
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

  // Agent chat orchestration hook (handles persistence, SSE streams, scroll refs, session actions)
  const {
    messages,
    isMessagesLoading,
    activeStreamMessage,
    isLoading,
    errorNotice,
    messagesEndRef,
    scrollContainerRef,
    handleScroll,
    handleSend,
    handleStop,
    handleNewSession,
    isNewChatDisabled,
  } = useAgentChat({ mode });

  // Derive empty state indicator
  const isChatEmpty = !isMessagesLoading && messages.length === 0 && !activeStreamMessage;

  // Prepare quick-action prompt templates for empty state
  const quickActions = useMemo<QuickActionItem[]>(() => {
    if (isGlobalWorkspace) {
      return APP_CONTENT.chat.globalQuickActions;
    }
    const { baseAsset, quoteAsset } = parseSymbolAssets(cleanSymbol);
    return APP_CONTENT.chat.getSymbolQuickActions(cleanSymbol, baseAsset, quoteAsset);
  }, [isGlobalWorkspace, cleanSymbol]);

  // Identify latest completed assistant message to host interactive follow-up chips
  const lastAssistantMessageId = useMemo(() => {
    if (activeStreamMessage) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].status === 'success') {
        return messages[i].id;
      }
    }
    return null;
  }, [messages, activeStreamMessage]);

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
          {/* Atmospheric Ambient Depth Glow */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 ambient-glow-gemini transition-opacity duration-500 ease-out ${
              isChatEmpty ? 'opacity-90' : 'opacity-30'
            }`}
          />

          {/* Empty State Overlay */}
          {isChatEmpty && (
            <ChatEmptyState
              isLoading={isLoading}
              onSend={handleSend}
              onStop={handleStop}
              quickActions={quickActions}
            />
          )}

          {/* Messages Scroll Feed */}
          <ChatMessageList
            messages={messages}
            activeStreamMessage={activeStreamMessage}
            isLoading={isLoading}
            errorNotice={errorNotice}
            lastAssistantMessageId={lastAssistantMessageId}
            isChatEmpty={isChatEmpty}
            scrollContainerRef={scrollContainerRef}
            messagesEndRef={messagesEndRef}
            onScroll={handleScroll}
            onSend={handleSend}
          />

          {/* Persistent Bottom Dock Input */}
          {!isChatEmpty && (
            <ChatDock
              isLoading={isLoading}
              onSend={handleSend}
              onStop={handleStop}
            />
          )}
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
            stageView === 'agent' && !isChatEmpty
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
