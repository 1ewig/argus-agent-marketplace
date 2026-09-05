'use client';

import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { AgentLoader, ArgusIcon } from '@/components/common';
import { APP_CONTENT } from '@/constants/content';
import {
  emptyStateContainerVariants,
  emptyStateItemVariants,
  tapScalePill,
  hoverLiftPill,
} from '@/constants/animation';
import { useAgentChat } from '@/hooks';
import { ChatMessage } from './chat-message';
import { ChatInput, type ChatInputHandle } from './chat-input';
import type { ExecutionMode } from '@/lib/types';

interface ChatClientProps {
  mode?: ExecutionMode;
}

export function ChatClient({ mode = 'simulation' }: ChatClientProps) {
  const chatInputRef = useRef<ChatInputHandle>(null);

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

  const handleSelectTemplate = useCallback((template: string) => {
    chatInputRef.current?.setInputText(template);
  }, []);

  const isChatEmpty = !isMessagesLoading && messages.length === 0 && !activeStreamMessage;

  return (
    <div className="relative flex flex-col h-full w-full bg-theme-bg-base overflow-hidden">
      {/* Gemini-Style Atmospheric Ambient Depth Glow */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ambient-glow-gemini transition-opacity duration-150 ${
          isChatEmpty ? 'opacity-90' : 'opacity-30'
        }`}
      />

      {/* Empty State Overlay (instant unmount when switching to established conversation — no exit fade) */}
      {isChatEmpty && (
        <motion.div
          key="empty-state-canvas"
          variants={emptyStateContainerVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 flex flex-col items-center justify-center p-spacing-md sm:p-spacing-lg text-center overflow-y-auto pointer-events-auto z-20 custom-scrollbar"
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
            <motion.div variants={emptyStateItemVariants} className="flex flex-col items-center w-full mb-spacing-md">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-theme-text-primary tracking-tight font-sans leading-tight text-center">
                {APP_CONTENT.chat.emptyTitle}
              </h3>
            </motion.div>

            {/* Hero Input */}
            <motion.div
              variants={emptyStateItemVariants}
              className="w-full max-w-2xl px-spacing-xs mb-spacing-md"
            >
              <ChatInput
                ref={chatInputRef}
                key="hero-input"
                isLoading={isLoading}
                onSend={handleSend}
                onStop={handleStop}
                className="max-w-2xl"
                containerClassName="w-full p-0 bg-transparent shrink-0"
                autoFocus
              />
            </motion.div>

            {/* Quick Action Template Pills (directly below ChatInput) */}
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
                    type="button"
                    whileHover={hoverLiftPill}
                    whileTap={tapScalePill}
                    onClick={() => handleSelectTemplate(action.template)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-theme-bg-surface/80 hover:bg-theme-bg-surface active:bg-theme-bg-elevated border border-theme-border-subtle hover:border-theme-border-strong active:border-theme-border-strong text-theme-text-secondary hover:text-theme-text-primary text-xs font-medium cursor-pointer transition-colors duration-150 shadow-2xs group select-none backdrop-blur-xs"
                  >
                    <span className="leading-tight">{action.label}</span>
                    <ArrowUpRight className="size-3 text-theme-text-muted group-hover:text-theme-brand-binance group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150 shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`relative z-10 flex-1 overflow-y-auto overscroll-y-contain [will-change:scroll-position] [transform:translateZ(0)] px-spacing-md sm:px-spacing-lg pt-spacing-md pb-spacing-lg min-h-0 custom-scrollbar ${
          isChatEmpty ? 'pointer-events-none select-none opacity-0' : 'opacity-100'
        }`}
      >
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-spacing-md">
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              animateEntrance={index === messages.length - 1 && isLoading}
            />
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
      </div>

      {/* Persistent Bottom Dock Input (remains mounted across active chats to prevent flicker) */}
      {!isChatEmpty && (
        <div className="relative z-20 w-full bg-gradient-to-t from-theme-bg-base via-theme-bg-base/95 to-transparent pt-3 pb-spacing-md px-spacing-md sm:px-spacing-lg shrink-0">
          <ChatInput
            ref={chatInputRef}
            isLoading={isLoading}
            onSend={handleSend}
            onStop={handleStop}
            containerClassName="w-full p-0 bg-transparent"
          />
        </div>
      )}
    </div>
  );
}