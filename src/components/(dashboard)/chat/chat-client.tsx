'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronDown, Plus, Globe } from 'lucide-react';
import { AgentLoader, ArgusIcon } from '@/components/common';
import { APP_CONTENT } from '@/constants/content';
import {
  emptyStateContainerVariants,
  emptyStateGlowVariants,
  emptyStateItemVariants,
  tapScalePill,
  hoverLiftPill,
} from '@/constants/animation';
import { useAgentChat, useChatSessions } from '@/hooks';
import { useAppStore } from '@/stores/app-store';
import { ChatMessage } from './chat-message';
import { ChatInput, type ChatInputHandle } from './chat-input';
import type { ExecutionMode } from '@/lib/types';

interface ChatClientProps {
  mode?: ExecutionMode;
}

export function ChatClient({ mode = 'simulation' }: ChatClientProps) {
  const chatInputRef = useRef<ChatInputHandle>(null);
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const setIsSymbolSearchOpen = useAppStore((state) => state.setIsSymbolSearchOpen);
  const { handleNewSession, isNewChatDisabled } = useChatSessions();

  const isGlobalWorkspace = (selectedSymbol || '').toUpperCase() === 'GLOBAL';
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

  const handleSelectTemplate = useCallback((template: string) => {
    chatInputRef.current?.setInputText(template);
  }, []);

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
      {/* 1. Top Bar with Minimal Active Symbol & New Chat Trigger */}
      <div className="relative z-30 h-14 px-spacing-md sm:px-spacing-lg border-b border-theme-border-subtle bg-theme-bg-base/90 backdrop-blur-xs flex items-center justify-between shrink-0">
        <div className="flex items-center">
          {/* Minimal Symbol / Workspace Dropdown Button with Tactile Press */}
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={() => setIsSymbolSearchOpen(true)}
            title={APP_CONTENT.chat.switchSymbolTooltip}
            className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 -ml-2 rounded-lg text-theme-text-primary hover:bg-theme-bg-surface active:bg-theme-bg-elevated border border-transparent hover:border-theme-border-subtle transition-colors cursor-pointer select-none"
          >
            {isGlobalWorkspace ? (
              <>
                <Globe className="size-3.5 text-theme-brand-binance shrink-0" />
                <span className="text-xs sm:text-sm font-bold tracking-wider">
                  {APP_CONTENT.chat.globalWorkspaceTitle}
                </span>
              </>
            ) : (
              <span className="text-xs sm:text-sm font-bold tracking-wider">
                {cleanSymbol}
              </span>
            )}
            <ChevronDown className="size-3.5 text-theme-text-muted group-hover:text-theme-text-primary transition-colors" />
          </motion.button>
        </div>

        {/* Right Header Section: New Chat Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* New Chat Primary Action Button */}
          <motion.button
            type="button"
            whileTap={isNewChatDisabled ? undefined : tapScalePill}
            onClick={() => handleNewSession()}
            disabled={isNewChatDisabled}
            title={
              isNewChatDisabled
                ? APP_CONTENT.chat.newSessionDisabled
                : APP_CONTENT.chat.newChatTooltip
            }
            aria-label={APP_CONTENT.chat.newChatButton}
            className={`h-8 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 select-none transition-colors ${
              isNewChatDisabled
                ? 'opacity-40 cursor-not-allowed bg-theme-brand-binance text-theme-bg-overlay'
                : 'bg-theme-brand-binance text-theme-bg-overlay cursor-pointer shadow-2xs hover:brightness-105 active:brightness-95'
            }`}
          >
            <Plus className="size-3.5 stroke-[2.75]" />
            <span className="font-bold">{APP_CONTENT.chat.newChatButton}</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Main Chat Stage Body */}
      <div className="relative flex-1 min-h-0 w-full flex flex-col overflow-hidden">
        {/* Gemini-Style Atmospheric Ambient Depth Glow */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ambient-glow-gemini transition-opacity duration-500 ease-out ${isChatEmpty ? 'opacity-90' : 'opacity-30'
            }`}
        />

        {/* Dynamic Luminous Glow */}
        {isChatEmpty && (
          <motion.div
            key="chat-empty-glow"
            variants={emptyStateGlowVariants}
            initial="hidden"
            animate="visible"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden z-0"
          >
            <div className="absolute inset-0 chat-empty-glow animate-glow-breathe" />
          </motion.div>
        )}

        {/* Empty State Overlay */}
        {isChatEmpty && (
          <motion.div
            key="empty-state-canvas"
            variants={emptyStateContainerVariants}
            initial="hidden"
            animate="visible"
            className="absolute inset-0 flex flex-col items-center justify-center p-spacing-md sm:p-spacing-lg text-center overflow-y-auto pointer-events-auto z-20 custom-scrollbar"
          >
            <div className="my-auto flex flex-col items-center justify-center w-full py-spacing-md max-w-3xl">
              {/* Header Stack */}
              <motion.div
                variants={emptyStateItemVariants}
                className="flex flex-col items-center text-center max-w-xl mb-spacing-lg"
              >
                <div className="size-10 rounded-2xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center mb-3 shadow-2xs">
                  <ArgusIcon className="size-5 text-theme-brand-binance" />
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-theme-text-primary tracking-tight font-sans leading-tight">
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
                  showAura={true}
                />
              </motion.div>

              {/* Quick Action Template Pills */}
              <motion.div variants={emptyStateItemVariants} className="flex flex-col items-center gap-spacing-xs w-full">
                <div className="flex items-center justify-center mb-0.5">
                  <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                    {APP_CONTENT.chat.quickActionsTitle}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
                  {(isGlobalWorkspace
                    ? APP_CONTENT.chat.globalQuickActions
                    : APP_CONTENT.chat.quickActions
                  ).map((action) => (
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
          className={`relative z-10 flex-1 overflow-y-auto overscroll-y-contain [will-change:scroll-position] [transform:translateZ(0)] px-spacing-md sm:px-spacing-lg pt-spacing-md pb-spacing-lg min-h-0 custom-scrollbar ${isChatEmpty ? 'pointer-events-none select-none opacity-0' : 'opacity-100'
            }`}
        >
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-spacing-md">
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                animateEntrance={index === messages.length - 1 && isLoading}
                isLatestAssistantMessage={msg.id === lastAssistantMessageId}
                onSelectFollowUp={handleSend}
              />
            ))}

            {activeStreamMessage && !messages.some((m) => m.id === activeStreamMessage.id) && (
              <ChatMessage key={activeStreamMessage.id} message={activeStreamMessage} isStreaming={true} />
            )}

            {isLoading && !activeStreamMessage && (
              <div className="flex items-center gap-spacing-sm p-spacing-md bg-theme-bg-elevated rounded-xl border border-theme-border-subtle animate-pulse">
                <AgentLoader className="size-5 text-theme-brand-binance shrink-0" />
                <span className="text-sm text-theme-text-secondary font-medium">
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

        {/* Persistent Bottom Dock Input */}
        {!isChatEmpty && (
          <div className="relative z-20 w-full bg-gradient-to-t from-theme-bg-base via-theme-bg-base/95 to-transparent pb-spacing-lg sm:pb-spacing-xl px-spacing-md sm:px-spacing-lg shrink-0">
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
    </div>
  );
}