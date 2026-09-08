'use client';

import React, { useCallback } from 'react';
import { useBinanceMarketStream, useChatSessions } from '@/hooks';
import { isGlobalSymbol, normalizeSymbolForDisplay } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { DashboardHeader } from './dashboard-header';
import { MarketPanel } from './market-panel';
import { ChatClient } from './chat';
import type { ExecutionMode } from '@/lib/types';

interface DashboardClientProps {
  mode?: ExecutionMode;
}

/**
 * Main orchestrator for the dashboard layout, header controls, and workspace stages.
 * Pure layout shell hosting ChatClient and collapsible MarketPanel.
 */
export function DashboardClient({ mode = 'simulation' }: DashboardClientProps) {
  // Global application UI state
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const isMarketPanelOpen = useAppStore((state) => state.isMarketPanelOpen);
  const rightPanelTab = useAppStore((state) => state.rightPanelTab);
  const toggleMarketPanel = useAppStore((state) => state.toggleMarketPanel);
  const toggleMobileSidebar = useAppStore((state) => state.toggleMobileSidebar);
  const setIsSymbolSearchOpen = useAppStore((state) => state.setIsSymbolSearchOpen);

  // Symbol domain parsing
  const cleanSymbol = normalizeSymbolForDisplay(selectedSymbol) || 'BTCUSDT';
  const isGlobalWorkspace = isGlobalSymbol(cleanSymbol);

  // Shared real-time client-direct Binance Spot WebSocket connection (powers telemetry cards)
  const isSpotStreamActive =
    !isGlobalWorkspace && isMarketPanelOpen && rightPanelTab === 'overview';

  const { ticker, orderBook, status: spotStatus } = useBinanceMarketStream(cleanSymbol, {
    enabled: isSpotStreamActive,
    depthLevels: 8,
  });

  // Session management for DashboardHeader
  const { isNewChatDisabled, handleNewSession } = useChatSessions();

  // Header interaction handlers
  const handleOpenSymbolSearch = useCallback(() => {
    setIsSymbolSearchOpen(true);
  }, [setIsSymbolSearchOpen]);

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
        onToggleMobileSidebar={toggleMobileSidebar}
        onOpenSymbolSearch={handleOpenSymbolSearch}
        onNewChat={handleNewChat}
        onToggleMarketPanel={toggleMarketPanel}
      />

      {/* 2. Main Stage Body: Horizontal Flex (Chat Column + Right Market Panel) */}
      <div className="relative flex-1 min-h-0 w-full flex flex-row overflow-hidden">
        {/* Central Stage: Agent Chat View */}
        <div className="relative flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          <ChatClient mode={mode} />
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
    </div>
  );
}

