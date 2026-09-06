'use client';

import React, { useMemo, useCallback } from 'react';
import { useAgentChat } from '@/hooks';
import { isGlobalSymbol, normalizeSymbolForDisplay } from '@/lib/utils';
import { parseSymbolAssets } from '@/lib/symbols';
import { APP_CONTENT } from '@/constants/content';
import { useAppStore, isIntelligenceTabActive } from '@/stores/app-store';
import { DashboardHeader } from './dashboard-header';
import { MarketPanel } from './market-panel';
import { ChatEmptyState, ChatMessageList, ChatDock, type QuickActionItem } from './chat';
import type { ExecutionMode } from '@/lib/types';

interface DashboardClientProps {
  mode?: ExecutionMode;
}

/**
 * Main orchestrator for the dashboard stage, chat feed, and header controls.
 * Connects directly to stores and chat hooks, driving pure presentation components via props.
 */
export function DashboardClient({ mode = 'simulation' }: DashboardClientProps) {
  // Global application UI state
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const isMarketPanelOpen = useAppStore((state) => state.isMarketPanelOpen);
  const setIsMarketPanelOpen = useAppStore((state) => state.setIsMarketPanelOpen);
  const toggleMarketPanel = useAppStore((state) => state.toggleMarketPanel);
  const rightPanelTab = useAppStore((state) => state.rightPanelTab);
  const setRightPanelTab = useAppStore((state) => state.setRightPanelTab);
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

  const isMarketIntelligenceActive = isIntelligenceTabActive(rightPanelTab);

  // Header interaction handlers
  const handleOpenSymbolSearch = useCallback(() => {
    setIsSymbolSearchOpen(true);
  }, [setIsSymbolSearchOpen]);

  const handleToggleMarketIntelligence = useCallback(() => {
    if (!isMarketPanelOpen) {
      setIsMarketPanelOpen(true);
      setRightPanelTab('intelligence');
    } else if (isIntelligenceTabActive(rightPanelTab)) {
      setRightPanelTab('overview');
    } else {
      setRightPanelTab('intelligence');
    }
  }, [isMarketPanelOpen, rightPanelTab, setIsMarketPanelOpen, setRightPanelTab]);

  const handleNewChat = useCallback(() => {
    handleNewSession();
  }, [handleNewSession]);

  return (
    <div className="relative flex flex-col h-full w-full bg-theme-bg-base overflow-hidden">
      {/* 1. Header Toolbar with Workspace Selector, New Chat & Panel Toggles */}
      <DashboardHeader
        symbol={cleanSymbol}
        isGlobal={isGlobalWorkspace}
        isNewChatDisabled={isNewChatDisabled}
        isMarketPanelOpen={isMarketPanelOpen}
        isMarketIntelligenceActive={isMarketIntelligenceActive}
        onOpenSymbolSearch={handleOpenSymbolSearch}
        onNewChat={handleNewChat}
        onToggleMarketIntelligence={handleToggleMarketIntelligence}
        onToggleMarketPanel={toggleMarketPanel}
      />

      {/* 2. Main Stage Body: Horizontal Flex (Chat Column + Right Market Panel) */}
      <div className="relative flex-1 min-h-0 w-full flex flex-row overflow-hidden">
        {/* Chat Column */}
        <div className="relative flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
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
