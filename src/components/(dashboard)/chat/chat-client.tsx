'use client';

import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { AgentLoader, ArgusIcon } from '@/components/common';
import { APP_CONTENT } from '@/constants/content';
import {
  emptyStateContainerVariants,
  emptyStateItemVariants,
  tapScalePill,
} from '@/constants/animation';
import { useAgentChat } from '@/hooks';
import { ChatMessage } from './chat-message';
import { ChatHeader } from './chat-header';
import { ChatInput, type ChatInputHandle } from './chat-input';
import type { ExecutionMode } from '@/lib/types';

interface ChatClientProps {
  mode?: ExecutionMode;
}

export function ChatClient({ mode = 'simulation' }: ChatClientProps) {
  const chatInputRef = useRef<ChatInputHandle>(null);

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
    isNewChatDisabled,
    handleSelectSession,
    handleStartRename,
    handleSaveRename,
    handleCancelRename,
    handleDeleteSession,
    handleSend,
  } = useAgentChat({ mode });

  const handleSelectTemplate = useCallback((template: string) => {
    chatInputRef.current?.setInputText(template);
  }, []);

  return (
    <div className="flex flex-col h-full bg-theme-bg-surface border border-theme-border-subtle rounded-2xl overflow-hidden shadow-xs">
      {/* Dedicated Chat Header Bar */}
      <ChatHeader
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
        onNewSession={handleNewSession}
        isNewSessionDisabled={isNewChatDisabled}
      />

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto overscroll-y-contain [will-change:scroll-position] [transform:translateZ(0)] p-spacing-md sm:p-spacing-lg flex flex-col gap-spacing-md min-h-0"
      >
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              key={`empty-${activeConversationId}`}
              variants={emptyStateContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 flex flex-col items-center justify-center p-spacing-md sm:p-spacing-lg text-center overflow-y-auto pointer-events-auto z-10"
            >
              <div className="my-auto flex flex-col items-center justify-center w-full py-spacing-md max-w-3xl">
                {/* Category Tag */}
                <motion.div
                  variants={emptyStateItemVariants}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-brand-binance/10 border border-theme-brand-binance/30 text-theme-brand-binance text-2xs sm:text-xs font-bold uppercase tracking-wider mb-spacing-xs"
                >
                  <ArgusIcon className="size-3.5 text-theme-brand-binance" />
                  <span>{APP_CONTENT.chat.emptyCategory}</span>
                </motion.div>

                {/* Practical Utilitarian Headline */}
                <motion.div variants={emptyStateItemVariants} className="flex flex-col items-center w-full">
                  <h3 className="text-xl sm:text-2xl font-bold text-theme-text-primary tracking-tight mb-spacing-xs max-w-3xl font-sans leading-tight">
                    {APP_CONTENT.chat.emptyTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-theme-text-secondary max-w-2xl mb-spacing-md leading-relaxed">
                    {APP_CONTENT.chat.emptySubtitle}
                  </p>
                </motion.div>

                {/* Quick Action Template Pills */}
                <motion.div variants={emptyStateItemVariants} className="flex flex-col items-center gap-spacing-xs w-full">
                  <div className="flex items-center justify-center mb-0.5">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-theme-text-muted">
                      {APP_CONTENT.chat.quickActionsTitle}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
                    {APP_CONTENT.chat.quickActions.map((action) => (
                      <motion.button
                        key={action.id}
                        variants={emptyStateItemVariants}
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={tapScalePill}
                        onClick={() => handleSelectTemplate(action.template)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-theme-bg-elevated/70 hover:bg-theme-bg-surface active:bg-theme-bg-elevated border border-theme-border-subtle hover:border-theme-border-strong active:border-theme-border-strong text-theme-text-secondary hover:text-theme-text-primary text-xs font-medium cursor-pointer transition-colors shadow-2xs group select-none"
                      >
                        <span className="leading-tight">{action.label}</span>
                        <ArrowUpRight className="size-3 text-theme-text-muted group-hover:text-theme-brand-binance group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {activeStreamMessage && !messages.some((m) => m.id === activeStreamMessage.id) && (
          <ChatMessage key={activeStreamMessage.id} message={activeStreamMessage} isStreaming={true} />
        )}

        {isLoading && !activeStreamMessage && (
          <div className="flex items-center gap-spacing-sm p-spacing-md bg-theme-bg-elevated rounded-xl border border-theme-border-subtle animate-pulse">
            <AgentLoader className="size-4 text-theme-brand-binance shrink-0" />
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
        ref={chatInputRef}
        key={activeConversationId}
        isLoading={isLoading}
        onSend={handleSend}
      />
    </div>
  );
}