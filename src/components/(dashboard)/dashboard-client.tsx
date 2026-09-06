'use client';

import React, { useMemo, useCallback } from 'react';
import { useAgentChat } from '@/hooks';
import { isGlobalSymbol, normalizeSymbolForDisplay } from '@/lib/utils';
import { parseSymbolAssets } from '@/lib/symbols';
import { APP_CONTENT } from '@/constants/content';
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
  const isMarketPanelOpen = useAppStore((state) => state.isMarketPanelOpen);
  const toggleMarketPanel = useAppStore((state) => state.toggleMarketPanel);
  const setIsSymbolSearchOpen = useAppStore((state) => state.setIsSymbolSearchOpen);

  // Symbol domain parsing
  const cleanSymbol = normalizeSymbolForDisplay(selectedSymbol) || 'BTCUSDT';
  const isGlobalWorkspace = isGlobalSymbol(cleanSymbol);

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
      {/* 1. Header Toolbar with Workspace Selector, Chart Switcher, New Chat & Panel Toggles */}
      <DashboardHeader
        symbol={cleanSymbol}
        isGlobal={isGlobalWorkspace}
        stageView={stageView}
        isNewChatDisabled={isNewChatDisabled}
        isMarketPanelOpen={isMarketPanelOpen}
        onOpenSymbolSearch={handleOpenSymbolSearch}
        onToggleStageView={handleToggleStageView}
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
        />
      </div>
    </div>
  );
}
