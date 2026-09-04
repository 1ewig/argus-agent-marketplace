'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Plus, ArrowUpRight } from 'lucide-react';
import { ArgusIcon } from '../argus-icon';
import { APP_CONTENT } from '@/constants/content';
import {
  emptyStateContainerVariants,
  emptyStateItemVariants,
} from '@/constants/animation';
import { useAgentChat } from '@/hooks';
import { ChatMessage } from './chat-message';
import { ChatSessionsMenu } from './chat-sessions-menu';
import { ChatInput } from './chat-input';
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
    isLoading,
    errorNotice,
    isMenuOpen,
    handleToggleMenu,
    editingId,
    editTitle,
    setEditTitle,
    messagesEndRef,
    scrollContainerRef,
    handleScroll,
    menuRef,
    handleNewSession,
    handleSelectSession,
    handleStartRename,
    handleSaveRename,
    handleCancelRename,
    handleDeleteSession,
    handleSend,
  } = useAgentChat({ mode });

  return (
    <div className="flex flex-col h-full bg-theme-bg-surface border border-theme-border-subtle rounded-2xl overflow-hidden shadow-xs">
      {/* Architectural Header Bar */}
      <div className="flex items-center justify-between gap-spacing-xs px-spacing-md py-spacing-sm bg-theme-bg-surface border-b border-theme-border-subtle shrink-0">
        <div className="flex items-center gap-spacing-xs">
          <ArgusIcon className="size-4 text-theme-brand-binance shrink-0" />
          <div className="flex flex-col">
            <span className="text-2xs font-extrabold uppercase tracking-widest text-theme-text-muted">
              {APP_CONTENT.header.title}
            </span>
            <h2 className="text-xs font-bold text-theme-text-primary tracking-tight">
              {APP_CONTENT.chat.subtitle}
            </h2>
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

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => void handleNewSession()}
            title={APP_CONTENT.chat.newSessionButton}
            aria-label={APP_CONTENT.chat.newSessionButton}
            className="size-8 flex items-center justify-center rounded-xl bg-theme-bg-elevated hover:bg-theme-bg-base border border-theme-border-subtle hover:border-theme-border-strong text-theme-brand-binance hover:text-theme-brand-accent cursor-pointer transition-all shadow-2xs shrink-0"
          >
            <Plus className="size-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-spacing-md sm:p-spacing-lg flex flex-col gap-spacing-md min-h-0"
      >
        <AnimatePresence mode="wait">
          {messages.length === 0 && (
            <motion.div
              key={`empty-${activeConversationId}`}
              variants={emptyStateContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center justify-center flex-1 text-center py-spacing-xl"
            >
              {/* Category Tag */}
              <motion.div
                variants={emptyStateItemVariants}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-brand-binance/10 border border-theme-brand-binance/30 text-theme-brand-binance text-2xs font-extrabold uppercase tracking-widest mb-spacing-sm"
              >
                <ArgusIcon className="size-3.5 text-theme-brand-binance" />
                <span>{APP_CONTENT.chat.emptyCategory}</span>
              </motion.div>

              {/* Dominant Swiss Headline */}
              <motion.div variants={emptyStateItemVariants} className="flex flex-col items-center">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-theme-text-primary tracking-tight mb-spacing-xs max-w-lg">
                  {APP_CONTENT.chat.emptyTitle}
                </h3>
                <p className="text-xs text-theme-text-secondary max-w-md mb-spacing-xl leading-relaxed">
                  {APP_CONTENT.chat.emptySubtitle}
                </p>
              </motion.div>

              {/* Structured Architectural Suggestion Tiles */}
              <motion.div variants={emptyStateItemVariants} className="flex flex-col gap-spacing-xs w-full max-w-lg">
                <div className="flex items-center justify-between mb-spacing-xs px-1">
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-theme-text-muted">
                    {APP_CONTENT.chat.quickPromptsTitle}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-spacing-xs">
                  {APP_CONTENT.chat.quickPrompts.map((prompt) => (
                    <motion.button
                      key={prompt}
                      variants={emptyStateItemVariants}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => void handleSend(prompt)}
                      className="text-left text-xs p-3.5 rounded-xl bg-theme-bg-elevated/60 hover:bg-theme-bg-surface border border-theme-border-subtle hover:border-theme-border-strong text-theme-text-primary cursor-pointer transition-colors shadow-2xs hover:shadow-xs group flex items-start justify-between gap-spacing-sm"
                    >
                      <span className="leading-snug text-theme-text-primary group-hover:text-theme-text-primary font-medium">
                        {prompt}
                      </span>
                      <ArrowUpRight className="size-3.5 text-theme-text-muted group-hover:text-theme-brand-binance group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {activeStreamMessage && (
          <ChatMessage message={activeStreamMessage} isStreaming={true} />
        )}

        {isLoading && !activeStreamMessage && (
          <div className="flex items-center gap-spacing-sm p-spacing-md bg-theme-bg-elevated rounded-xl border border-theme-border-subtle animate-pulse">
            <RefreshCw className="size-4 text-theme-brand-binance animate-spin" />
            <span className="text-xs text-theme-text-secondary font-medium">
              {APP_CONTENT.chat.thinkingText}
            </span>
          </div>
        )}

        {errorNotice && (
          <div className="p-spacing-sm px-spacing-md bg-theme-bg-elevated border border-theme-status-danger text-theme-status-danger rounded-xl text-xs">
            {errorNotice}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Isolated Input Dock */}
      <ChatInput
        key={activeConversationId}
        isLoading={isLoading}
        onSend={handleSend}
      />
    </div>
  );
}