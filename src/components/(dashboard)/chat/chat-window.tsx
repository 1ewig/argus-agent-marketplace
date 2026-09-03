'use client';

import React, { useRef } from 'react';
import { Send, RefreshCw, Plus } from 'lucide-react';
import { ArgusIcon } from '../argus-icon';
import { APP_CONTENT } from '@/constants/content';
import { useAgentChat } from '@/hooks';
import { ChatMessage } from './chat-message';
import { ChatSessionsMenu } from './chat-sessions-menu';
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Clean auto-resize up to max height without layout shifts
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        void handleSend();
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    } else {
      handleKeyDown(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-theme-bg-surface border border-theme-border-subtle rounded-lg overflow-hidden shadow-sm">
      {/* Header bar */}
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

        {/* Sessions Dropdown and New Session Controls */}
        <div className="flex items-center gap-spacing-xs">
          <ChatSessionsMenu
            currentTitle={currentTitle}
            conversations={conversations}
            activeConversationId={activeConversationId}
            isMenuOpen={isMenuOpen}
            menuRef={menuRef}
            editingId={editingId}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            onToggleMenu={handleToggleMenu}
            onSelectSession={handleSelectSession}
            onStartRename={handleStartRename}
            onSaveRename={handleSaveRename}
            onCancelRename={handleCancelRename}
            onDeleteSession={handleDeleteSession}
          />

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

        {activeStreamMessage && (
          <ChatMessage message={activeStreamMessage} isStreaming={true} />
        )}

        {isLoading && !activeStreamMessage && (
          <div className="flex items-center gap-spacing-sm p-spacing-md bg-theme-bg-elevated rounded border border-theme-border-subtle animate-pulse">
            <RefreshCw className="size-4 text-theme-brand-binance animate-spin" />
            <span className="text-xs text-theme-text-secondary font-medium">
              {APP_CONTENT.chat.thinkingText}
            </span>
          </div>
        )}

        {errorNotice && (
          <div className="p-spacing-sm px-spacing-md bg-theme-bg-elevated border border-theme-status-danger text-theme-status-danger rounded text-xs">
            {errorNotice}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-spacing-sm bg-theme-bg-elevated border-t border-theme-border-subtle shrink-0">
        <div className="flex items-end gap-spacing-xs bg-theme-bg-surface border border-theme-border-subtle rounded p-spacing-xs focus-within:border-theme-border-strong focus-within:ring-1 focus-within:ring-theme-border-strong transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleCustomKeyDown}
            placeholder={APP_CONTENT.chat.inputPlaceholder}
            rows={1}
            className="flex-1 resize-none bg-transparent text-xs text-theme-text-primary placeholder:text-theme-text-muted focus:outline-hidden p-spacing-xs leading-relaxed max-h-32"
          />
          <button
            type="button"
            onClick={() => {
              void handleSend();
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
              }
            }}
            disabled={!input.trim() || isLoading}
            aria-label={APP_CONTENT.chat.sendButton}
            className="flex items-center justify-center size-8 rounded bg-theme-bg-overlay text-theme-brand-binance hover:bg-theme-border-strong disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs shrink-0"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}