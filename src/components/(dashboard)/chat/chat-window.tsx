'use client';

import React from 'react';
import { Send, RefreshCw, Plus, ChevronDown, Pencil, Trash2, Check, X } from 'lucide-react';
import { ArgusIcon } from '../argus-icon';
import { APP_CONTENT } from '@/constants/content';
import { useAgentChat } from '@/hooks';
import { ChatMessage } from './chat-message';
import type { ExecutionMode } from '@/lib/types';

interface ChatWindowProps {
  mode?: ExecutionMode;
}

export function ChatWindow({ mode = 'simulation' }: ChatWindowProps) {
  const {
    activeConversationId,
    currentTitle,
    conversations,
    messages,
    activeStreamMessage,
    input,
    setInput,
    isLoading,
    errorNotice,
    isMenuOpen,
    handleToggleMenu,
    editingId,
    editTitle,
    setEditTitle,
    messagesEndRef,
    menuRef,
    handleNewSession,
    handleSelectSession,
    handleStartRename,
    handleSaveRename,
    handleCancelRename,
    handleDeleteSession,
    handleSend,
    handleKeyDown,
  } = useAgentChat({ mode });

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
              onClick={handleToggleMenu}
              title={APP_CONTENT.sessions.openMenuAria}
              aria-label={APP_CONTENT.sessions.openMenuAria}
              className="h-7 flex items-center gap-spacing-xs text-2xs font-medium bg-theme-bg-surface hover:bg-theme-bg-base text-theme-text-primary border border-theme-border-subtle hover:border-theme-border-strong rounded px-spacing-sm cursor-pointer transition-colors shadow-2xs max-w-[150px] sm:max-w-[200px]"
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
                          className={`flex items-center justify-between gap-spacing-xs px-spacing-sm py-spacing-xs transition-colors ${isActive ? 'bg-theme-bg-elevated/70' : 'hover:bg-theme-bg-base'
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
                                  className={`text-2xs truncate ${isActive
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
            className="size-7 flex items-center justify-center rounded bg-theme-bg-surface hover:bg-theme-bg-base border border-theme-border-subtle hover:border-theme-border-strong text-theme-brand-binance hover:text-theme-brand-accent cursor-pointer transition-colors shadow-2xs shrink-0"
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

        {/* Live Streaming Message with Real-Time Process Timeline */}
        {activeStreamMessage && (
          <ChatMessage message={activeStreamMessage} isStreaming={true} />
        )}

        {/* Fallback Pulse Indicator before first SSE byte */}
        {isLoading && !activeStreamMessage && (
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