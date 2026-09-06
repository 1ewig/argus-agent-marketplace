'use client';

import React, { useMemo } from 'react';
import { useAgentChat } from '@/hooks';
import { isGlobalSymbol } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { DashboardHeader } from './dashboard-header';
import { MarketPanel } from './market-panel';
import { ChatEmptyState, ChatMessageList, ChatDock } from './chat';
import type { ExecutionMode } from '@/lib/types';

interface DashboardClientProps {
  mode?: ExecutionMode;
}

export function DashboardClient({ mode = 'simulation' }: DashboardClientProps) {
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const isMarketPanelOpen = useAppStore((state) => state.isMarketPanelOpen);

  const isGlobalWorkspace = isGlobalSymbol(selectedSymbol);
  const cleanSymbol = (selectedSymbol || 'BTCUSDT').toUpperCase();

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
  } = useAgentChat({ mode });

  const isChatEmpty = !isMessagesLoading && messages.length === 0 && !activeStreamMessage;

  // Identify the latest completed assistant message to host interactive follow-up chips
  const lastAssistantMessageId = useMemo(() => {
    if (activeStreamMessage) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].status === 'success') {
        return messages[i].id;
      }
    }
    return null;
  }, [messages, activeStreamMessage]);

  return (
    <div className="relative flex flex-col h-full w-full bg-theme-bg-base overflow-hidden">
      {/* 1. Header Toolbar with Workspace Selector, New Chat & Panel Toggles */}
      <DashboardHeader />

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
              cleanSymbol={cleanSymbol}
              isGlobalWorkspace={isGlobalWorkspace}
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
