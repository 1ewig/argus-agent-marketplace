'use client';

import React, { useMemo, memo } from 'react';
import { useAgentChat } from '@/hooks';
import { isGlobalSymbol, normalizeSymbolForDisplay } from '@/lib/utils';
import { parseSymbolAssets } from '@/lib/symbols';
import { APP_CONTENT } from '@/constants/content';
import { useAppStore } from '@/stores/app-store';
import { ChatEmptyState } from './chat-empty-state';
import { ChatMessageList } from './chat-message-list';
import { ChatDock } from './chat-dock';
import type { QuickActionItem } from './chat-empty-state';
import type { ExecutionMode } from '@/lib/types';

export interface ChatClientProps {
  mode?: ExecutionMode;
}

/**
 * Dedicated Chat Stage Client Orchestrator
 *
 * Encapsulates agent chat streaming, message history queries, scroll refs,
 * empty state templates, and user message submission.
 * Isolates high-frequency chat renders from the parent dashboard shell and siblings.
 */
export const ChatClient = memo(function ChatClient({ mode = 'simulation' }: ChatClientProps) {
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);

  // Symbol domain parsing for localized quick actions
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

  return (
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
  );
});
