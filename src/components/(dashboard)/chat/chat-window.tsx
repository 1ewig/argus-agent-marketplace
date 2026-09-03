'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Plus, ChevronDown, Pencil, Trash2, Check, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArgusIcon } from '../argus-icon';
import { APP_CONTENT } from '@/constants/content';
import { generateMessageId, getNowTimestamp } from '@/lib/utils';
import {
  db,
  DEFAULT_CONVERSATION_ID,
  ensureDefaultConversation,
  createConversation,
  deleteConversation,
  renameConversation,
  saveStoredMessage,
  listConversations,
  type ChatMessageRecord,
} from '@/lib/db';
import { ChatMessage } from './chat-message';
import type { AgentResult } from '@/agent';
import type { ExecutionMode } from '@/lib/types';

interface ChatWindowProps {
  mode?: ExecutionMode;
}

export function ChatWindow({ mode = 'simulation' }: ChatWindowProps) {
  const [activeConversationId, setActiveConversationId] = useState<string>(DEFAULT_CONVERSATION_ID);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 1. Initialize default conversation record safely on client mount
  useEffect(() => {
    void ensureDefaultConversation();
  }, []);

  // 2. Reactive Live Queries directly from Dexie IndexedDB (strictly read-only)
  const conversations = useLiveQuery(() => listConversations(), []) ?? [];
  const messages = useLiveQuery(
    () =>
      db.messages
        .where('conversationId')
        .equals(activeConversationId)
        .sortBy('timestamp'),
    [activeConversationId]
  ) ?? [];

  const messagesCount = messages.length;

  // 3. Auto-scroll to latest message whenever messages count or loading state updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesCount, isLoading]);

  // 4. Click-outside listener for sessions overflow menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setEditingId(null);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Active session title
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const currentTitle = activeConversation?.title ?? APP_CONTENT.chat.defaultSessionTitle;

  // 5. Create a brand new session thread
  const handleNewSession = async () => {
    setErrorNotice(null);
    setIsMenuOpen(false);
    setEditingId(null);
    const newConv = await createConversation();
    setActiveConversationId(newConv.id);
  };

  // 6. Switch session
  const handleSelectSession = (id: string) => {
    setActiveConversationId(id);
    setIsMenuOpen(false);
    setEditingId(null);
  };

  // 7. Start renaming session
  const handleStartRename = (id: string, sessionTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(sessionTitle);
  };

  // 8. Save renamed session
  const handleSaveRename = async (id: string, e?: React.FormEvent | React.MouseEvent) => {
    e?.stopPropagation();
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    await renameConversation(id, trimmed);
    setEditingId(null);
  };

  // 9. Cancel renaming
  const handleCancelRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  // 10. Delete session
  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversation(id);
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        const newConv = await createConversation();
        setActiveConversationId(newConv.id);
      }
    }
  };

  // 11. Send message with multi-turn context and persistent Dexie transactions
  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend ?? input).trim();
    if (!prompt || isLoading) return;

    setErrorNotice(null);
    setInput('');

    const userMessage: ChatMessageRecord = {
      id: generateMessageId('usr'),
      conversationId: activeConversationId,
      role: 'user',
      content: prompt,
      status: 'success',
      timestamp: getNowTimestamp(),
    };

    // Optimistically persist to Dexie (useLiveQuery instantly updates the UI!)
    await saveStoredMessage(userMessage);

    setIsLoading(true);

    try {
      // Send sliding window of past 10 valid messages from this session
      const conversationHistory = messages
        .filter((m) => m.status !== 'error')
        .slice(-10)
        .map((m) => ({
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

      const agentMessage: ChatMessageRecord = {
        id: generateMessageId('agt'),
        conversationId: activeConversationId,
        role: 'assistant',
        content: agentData.analysis,
        status: 'success',
        toolCalls: agentData.toolCalls,
        stepCount: agentData.stepCount,
        timestamp: agentData.timestamp,
      };

      await saveStoredMessage(agentMessage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : APP_CONTENT.chat.errorNotice;
      setErrorNotice(msg);

      // Persist durable error message into Dexie to avoid orphaned prompts
      const errorRecord: ChatMessageRecord = {
        id: generateMessageId('err'),
        conversationId: activeConversationId,
        role: 'assistant',
        content: msg,
        status: 'error',
        timestamp: getNowTimestamp(),
      };
      await saveStoredMessage(errorRecord);
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
      {/* Header bar: Brand, Session Switcher, Controls */}
      <div className="flex flex-wrap items-center justify-between gap-spacing-xs p-spacing-sm px-spacing-md bg-theme-bg-elevated border-b border-theme-border-subtle shrink-0">
        <div className="flex items-center gap-spacing-xs">
          <ArgusIcon className="size-4 text-theme-brand-binance shrink-0" />
          <div>
            <h2 className="text-xs font-bold text-theme-text-primary tracking-wide">
              {APP_CONTENT.chat.title}
            </h2>
            <p className="text-2xs text-theme-text-muted hidden sm:block">
              {APP_CONTENT.chat.subtitle}
            </p>
          </div>
        </div>

        {/* Sessions Overflow Menu & New Session Action */}
        <div className="flex items-center gap-spacing-xs">
          {/* Sessions Dropdown / Overflow Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen((prev) => !prev);
                setEditingId(null);
              }}
              title={APP_CONTENT.sessions.openMenuAria}
              aria-label={APP_CONTENT.sessions.openMenuAria}
              className="flex items-center gap-spacing-xs text-2xs font-medium bg-theme-bg-surface hover:bg-theme-bg-base text-theme-text-primary border border-theme-border-subtle hover:border-theme-border-strong rounded px-spacing-sm py-1 cursor-pointer transition-colors shadow-2xs max-w-[150px] sm:max-w-[200px]"
            >
              <span className="truncate">{currentTitle}</span>
              <ChevronDown className={`size-3 text-theme-text-muted shrink-0 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-spacing-xs w-72 sm:w-80 bg-theme-bg-surface border border-theme-border-subtle rounded-lg shadow-lg z-50 overflow-hidden">
                {/* Menu Header */}
                <div className="flex items-center justify-between px-spacing-sm py-spacing-xs bg-theme-bg-elevated border-b border-theme-border-subtle text-2xs font-semibold text-theme-text-secondary">
                  <span>{APP_CONTENT.sessions.menuTitle}</span>
                  <span className="px-spacing-xs py-0.5 rounded bg-theme-bg-surface text-theme-text-muted border border-theme-border-subtle text-2xs font-mono">
                    {conversations.length}
                  </span>
                </div>

                {/* Sessions List */}
                <div className="max-h-64 overflow-y-auto divide-y divide-theme-border-subtle">
                  {conversations.length === 0 ? (
                    <div className="p-spacing-sm text-2xs text-theme-text-muted text-center">
                      {APP_CONTENT.sessions.emptyState}
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const isActive = conv.id === activeConversationId;
                      const isEditing = editingId === conv.id;

                      return (
                        <div
                          key={conv.id}
                          className={`flex items-center justify-between gap-spacing-xs px-spacing-sm py-spacing-xs transition-colors ${
                            isActive ? 'bg-theme-bg-elevated/70' : 'hover:bg-theme-bg-base'
                          }`}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-spacing-xs w-full py-0.5">
                              <input
                                type="text"
                                autoFocus
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    void handleSaveRename(conv.id);
                                  } else if (e.key === 'Escape') {
                                    handleCancelRename();
                                  }
                                }}
                                placeholder={APP_CONTENT.sessions.renamePlaceholder}
                                className="flex-1 bg-theme-bg-surface text-2xs text-theme-text-primary px-spacing-xs py-1 rounded border border-theme-border-strong focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={(e) => void handleSaveRename(conv.id, e)}
                                title={APP_CONTENT.sessions.saveLabel}
                                aria-label={APP_CONTENT.sessions.saveLabel}
                                className="p-1 rounded hover:bg-theme-bg-surface text-theme-status-success cursor-pointer"
                              >
                                <Check className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelRename}
                                title={APP_CONTENT.sessions.cancelLabel}
                                aria-label={APP_CONTENT.sessions.cancelLabel}
                                className="p-1 rounded hover:bg-theme-bg-surface text-theme-text-muted hover:text-theme-text-primary cursor-pointer"
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSelectSession(conv.id)}
                                className="flex items-center gap-spacing-xs flex-1 text-left min-w-0 cursor-pointer py-1"
                              >
                                {isActive && (
                                  <span className="size-1.5 rounded-full bg-theme-brand-binance shrink-0" />
                                )}
                                <span
                                  className={`text-2xs truncate ${
                                    isActive
                                      ? 'text-theme-text-primary font-bold'
                                      : 'text-theme-text-secondary hover:text-theme-text-primary'
                                  }`}
                                >
                                  {conv.title}
                                </span>
                              </button>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                                  title={APP_CONTENT.sessions.renameLabel}
                                  aria-label={APP_CONTENT.sessions.renameLabel}
                                  className="p-1 rounded text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-surface cursor-pointer transition-colors"
                                >
                                  <Pencil className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => void handleDeleteSession(conv.id, e)}
                                  title={APP_CONTENT.sessions.deleteLabel}
                                  aria-label={APP_CONTENT.sessions.deleteLabel}
                                  className="p-1 rounded text-theme-text-muted hover:text-theme-status-danger hover:bg-theme-bg-surface cursor-pointer transition-colors"
                                >
                                  <Trash2 className="size-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* New Session Button (Plus Icon) */}
          <button
            type="button"
            onClick={() => void handleNewSession()}
            title={APP_CONTENT.chat.newSessionButton}
            aria-label={APP_CONTENT.chat.newSessionButton}
            className="flex items-center justify-center size-7 rounded bg-theme-bg-surface hover:bg-theme-bg-base border border-theme-border-subtle text-theme-brand-binance hover:text-theme-brand-accent cursor-pointer transition-colors shadow-2xs shrink-0"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-spacing-md flex flex-col gap-spacing-sm min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-spacing-lg">
            <div className="mb-spacing-sm flex items-center justify-center">
              <ArgusIcon className="size-10 text-theme-brand-binance" />
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

        {/* Transient Error Notice */}
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
