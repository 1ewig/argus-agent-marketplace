'use client';

import React, { useMemo, memo } from 'react';
import { useAgentChat } from '@/hooks';
import { APP_CONTENT } from '@/constants/content';
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
 */
export const ChatClient = memo(function ChatClient({ mode = 'simulation' }: ChatClientProps) {
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

  const quickActions = useMemo<QuickActionItem[]>(
    () => APP_CONTENT.chat.quickActions,
    []
  );

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
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ambient-glow-gemini transition-opacity duration-500 ease-out ${
          isChatEmpty ? 'opacity-90' : 'opacity-30'
        }`}
      />

      {isChatEmpty && (
        <ChatEmptyState
          isLoading={isLoading}
          onSend={handleSend}
          onStop={handleStop}
          quickActions={quickActions}
        />
      )}

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
