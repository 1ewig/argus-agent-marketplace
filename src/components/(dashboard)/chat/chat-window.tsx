'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { ArgusIcon } from '../argus-icon';
import { APP_CONTENT } from '@/constants/content';
import { generateMessageId, getNowTimestamp } from '@/lib/utils';
import { getStoredMessages, saveStoredMessage, clearStoredMessages } from '@/lib/db';
import { ChatMessage, type ChatMessageData } from './chat-message';
import type { AgentResult } from '@/agent';
import type { ExecutionMode } from '@/lib/types';

interface ChatWindowProps {
  mode?: ExecutionMode;
}

export function ChatWindow({ mode = 'simulation' }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Load persistent chat history from Dexie IndexedDB
  useEffect(() => {
    let isMounted = true;

    getStoredMessages()
      .then((records) => {
        if (isMounted) {
          if (records.length > 0) {
            setMessages(
              records.map((r) => ({
                id: r.id,
                role: r.role,
                content: r.content,
                toolCalls: r.toolCalls,
                stepCount: r.stepCount,
                timestamp: r.timestamp,
              }))
            );
          } else {
            setMessages([]);
          }
        }
      })
      .catch(() => {
        // Fallback gracefully if IndexedDB is unavailable
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 3. Clear persistent history
  const handleClear = async () => {
    await clearStoredMessages();
    setMessages([]);
  };

  // 4. Send message with multi-turn context and Dexie persistence
  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend ?? input).trim();
    if (!prompt || isLoading) return;

    setErrorNotice(null);
    setInput('');

    const userMessage: ChatMessageData = {
      id: generateMessageId('usr'),
      role: 'user',
      content: prompt,
      timestamp: getNowTimestamp(),
    };

    // Optimistically update UI and persist to Dexie
    setMessages((prev) => [...prev, userMessage]);
    void saveStoredMessage(userMessage);

    setIsLoading(true);

    try {
      // Prepare multi-turn history: send sliding window of past 10 messages
      const conversationHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          mode,
          history: conversationHistory,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error ?? APP_CONTENT.chat.errorNotice);
      }

      const agentData: AgentResult = json.data;

      const agentMessage: ChatMessageData = {
        id: generateMessageId('agt'),
        role: 'assistant',
        content: agentData.analysis,
        toolCalls: agentData.toolCalls,
        stepCount: agentData.stepCount,
        timestamp: agentData.timestamp,
      };

      // Update state and persist to Dexie
      setMessages((prev) => [...prev, agentMessage]);
      void saveStoredMessage(agentMessage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : APP_CONTENT.chat.errorNotice;
      setErrorNotice(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-theme-bg-surface border border-theme-border-subtle rounded-lg overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between p-spacing-sm px-spacing-md bg-theme-bg-elevated border-b border-theme-border-subtle">
        <div className="flex items-center gap-spacing-xs">
          <ArgusIcon className="size-4 text-theme-brand-binance shrink-0" />
          <div>
            <h2 className="text-xs font-bold text-theme-text-primary tracking-wide">
              {APP_CONTENT.chat.title}
            </h2>
            <p className="text-2xs text-theme-text-muted">
              {APP_CONTENT.chat.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-spacing-xs">
          <button
            type="button"
            onClick={() => void handleClear()}
            title={APP_CONTENT.chat.clearButton}
            className="text-theme-text-muted hover:text-theme-text-primary p-spacing-xs rounded hover:bg-theme-bg-surface cursor-pointer transition-colors"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-spacing-md flex flex-col gap-spacing-sm min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-spacing-lg">
            <div className="size-11 rounded-lg flex items-center justify-center bg-theme-bg-overlay text-theme-brand-binance mb-spacing-sm shadow-sm border border-theme-border-strong">
              <ArgusIcon className="size-6 text-theme-brand-binance" />
            </div>
            <h3 className="text-sm font-bold text-theme-text-primary mb-spacing-xs">
              {APP_CONTENT.chat.emptyTitle}
            </h3>
            <p className="text-xs text-theme-text-secondary max-w-sm mb-spacing-lg leading-normal">
              {APP_CONTENT.chat.emptySubtitle}
            </p>

            {/* Quick Action Suggestion Chips */}
            <div className="flex flex-col gap-spacing-xs w-full max-w-md">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-theme-text-muted text-left mb-spacing-xs">
                {APP_CONTENT.chat.quickPromptsTitle}
              </span>
              {APP_CONTENT.chat.quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void handleSend(prompt)}
                  className="text-left text-xs p-spacing-sm rounded bg-theme-bg-elevated hover:bg-theme-bg-base border border-theme-border-subtle hover:border-theme-border-strong text-theme-text-primary cursor-pointer transition-all shadow-2xs hover:translate-x-0.5"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Thinking Indicator */}
        {isLoading && (
          <div className="flex items-center gap-spacing-sm p-spacing-md bg-theme-bg-elevated rounded border border-theme-border-subtle animate-pulse">
            <RefreshCw className="size-4 text-theme-brand-binance animate-spin" />
            <span className="text-xs text-theme-text-secondary font-medium">
              {APP_CONTENT.chat.thinkingText}
            </span>
          </div>
        )}

        {/* Error Notice */}
        {errorNotice && (
          <div className="p-spacing-sm px-spacing-md bg-theme-bg-elevated border border-theme-status-danger text-theme-status-danger rounded text-xs">
            {errorNotice}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-spacing-sm bg-theme-bg-elevated border-t border-theme-border-subtle">
        <div className="flex items-end gap-spacing-xs bg-theme-bg-surface border border-theme-border-subtle rounded p-spacing-xs focus-within:border-theme-border-strong focus-within:ring-1 focus-within:ring-theme-border-strong transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={APP_CONTENT.chat.inputPlaceholder}
            rows={2}
            className="flex-1 resize-none bg-transparent text-xs text-theme-text-primary placeholder:text-theme-text-muted focus:outline-hidden p-spacing-xs leading-relaxed"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || isLoading}
            aria-label={APP_CONTENT.chat.sendButton}
            className="flex items-center justify-center size-9 rounded bg-theme-bg-overlay text-theme-brand-binance hover:bg-theme-border-strong disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs shrink-0"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
