'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { User, AlertCircle, Loader2 } from 'lucide-react';
import { ArgusIcon } from '../argus-icon';
import { APP_CONTENT } from '@/constants/content';
import { EASING_ARCHITECTURAL } from '@/constants/animation';
import { MarkdownView } from '../markdown-view';
import { AgentProcessTimeline } from './agent-process-timeline';
import { normalizeMessageSteps } from '@/lib/db';
import { useActiveTimer } from '@/hooks';
import type { ExecutedToolCall, AgentExecutionStep } from '@/agent';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: 'success' | 'error' | 'pending';
  toolCalls?: ExecutedToolCall[];
  steps?: AgentExecutionStep[];
  stepCount?: number;
  workedDurationMs?: number;
  timestamp: number;
}

interface ChatMessageProps {
  message: ChatMessageData;
  isStreaming?: boolean;
}

/**
 * Live drafting indicator displaying elapsed execution time while the assistant prepares a response.
 */
function AgentWorkingDraftIndicator({ startedAt }: { startedAt: number }) {
  const elapsedSeconds = useActiveTimer(startedAt, true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASING_ARCHITECTURAL }}
      className="flex items-center gap-spacing-xs text-xs text-theme-text-muted py-1"
    >
      <Loader2 className="size-3.5 text-theme-brand-binance animate-spin shrink-0" />
      <span>{APP_CONTENT.process.agentWorking(elapsedSeconds)}</span>
    </motion.div>
  );
}

/**
 * Message bubble with user/assistant asymmetry.
 * Wrapped in React.memo to prevent token streaming from re-rendering the full chat history.
 */
export const ChatMessage = memo(function ChatMessage({
  message,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // 1. User Message (Right-aligned elevated capsule blending smoothly with architectural theme)
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, ease: EASING_ARCHITECTURAL }}
        className="flex justify-end items-start gap-spacing-xs w-full py-1 [content-visibility:auto] [contain-intrinsic-size:0_60px]"
      >
        <div className="flex flex-col items-end gap-1 max-w-[85%] sm:max-w-[75%]">
          <div className="bg-theme-bg-elevated text-theme-text-primary px-4 py-3 rounded-2xl rounded-tr-xs shadow-2xs border border-theme-border-subtle text-xs font-medium leading-relaxed break-words select-text">
            {message.content}
          </div>
          <span className="text-2xs font-mono text-theme-text-muted px-1">
            {formattedTime}
          </span>
        </div>
        <div className="size-7 rounded-full bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center text-theme-text-secondary shrink-0 mt-0.5 shadow-2xs">
          <User className="size-3.5" />
        </div>
      </motion.div>
    );
  }

  // 2. Assistant Message
  const effectiveSteps: AgentExecutionStep[] = React.useMemo(() => {
    return normalizeMessageSteps(message, APP_CONTENT.process.thinking).filter((step) => {
      if (step.type === 'thinking') {
        return Boolean(step.reasoningText?.trim());
      }
      return true;
    });
  }, [message]);

  const hasSteps = effectiveSteps.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, delay: 0.04, ease: EASING_ARCHITECTURAL }}
      className="flex items-start gap-spacing-sm w-full max-w-[95%] py-1 [content-visibility:auto] [contain-intrinsic-size:0_100px]"
    >
      {/* Brand Monogram Icon */}
      <div className="size-8 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center shrink-0 shadow-2xs">
        <ArgusIcon className="size-4.5 text-theme-brand-binance shrink-0" />
      </div>

      <div className="flex-1 flex flex-col gap-spacing-xs min-w-0">
        {/* Header Bar */}
        <div className="flex items-center gap-spacing-xs text-2xs text-theme-text-muted px-1">
          <span className="font-bold text-theme-text-primary tracking-tight">
            {APP_CONTENT.chat.agentRole}
          </span>
          <span>•</span>
          <span className="font-mono">{formattedTime}</span>
          {isError && (
            <span className="inline-flex items-center gap-1 text-2xs text-theme-status-danger font-semibold ml-1">
              <AlertCircle className="size-3 text-theme-status-danger" />
              {APP_CONTENT.chat.errorMessageTitle}
            </span>
          )}
        </div>

        {/* Chronological Process Timeline (Worked Group: Thoughts, Tools, Intermediate Text) */}
        {hasSteps && (
          <AgentProcessTimeline
            steps={effectiveSteps}
            isStreaming={isStreaming}
            isCompleted={!isStreaming}
            workedDurationMs={message.workedDurationMs}
            startedAt={message.timestamp}
          />
        )}

        {/* Main Response Markdown Container */}
        {message.content ? (
          <div
            className={`p-4 sm:p-5 rounded-2xl rounded-tl-xs shadow-2xs border text-xs leading-relaxed transition-colors ${
              isError
                ? 'bg-theme-bg-surface border-theme-status-danger text-theme-status-danger'
                : 'bg-theme-bg-surface border-theme-border-subtle text-theme-text-primary'
            }`}
          >
            <MarkdownView content={message.content} />
          </div>
        ) : isStreaming && !hasSteps ? (
          /* Live Drafting Indicator while assistant generates response before steps attach */
          <AgentWorkingDraftIndicator startedAt={message.timestamp} />
        ) : null}
      </div>
    </motion.div>
  );
});