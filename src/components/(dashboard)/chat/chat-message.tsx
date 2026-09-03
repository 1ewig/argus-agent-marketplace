'use client';

import React from 'react';
import { User, AlertCircle, Loader2 } from 'lucide-react';
import { ArgusIcon } from '../argus-icon';
import { APP_CONTENT } from '@/constants/content';
import { MarkdownView } from '../markdown-view';
import { AgentProcessTimeline } from './agent-process-timeline';
import type { ExecutedToolCall, AgentExecutionStep } from '@/agent';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: 'success' | 'error' | 'pending';
  toolCalls?: ExecutedToolCall[];
  steps?: AgentExecutionStep[];
  stepCount?: number;
  timestamp: number;
}

interface ChatMessageProps {
  message: ChatMessageData;
  isStreaming?: boolean;
}

/**
 * Modern chat bubble component with clear visual asymmetry between User and Assistant:
 * - User: Right-aligned distinctive dark capsule bubble with circular user avatar.
 * - Assistant: Left-aligned with Argus brand avatar, collapsible thinking/tool process header,
 *   and structured Swiss FinTech response card.
 */
export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // 1. User Chat Bubble (Right-aligned, distinctive capsule shape)
  if (isUser) {
    return (
      <div className="flex justify-end items-start gap-spacing-xs w-full py-1">
        <div className="flex flex-col items-end gap-1 max-w-[85%] sm:max-w-[75%]">
          <div className="bg-theme-bg-overlay text-white px-spacing-md py-spacing-sm rounded-2xl rounded-tr-xs shadow-sm border border-theme-border-strong text-xs font-normal leading-relaxed break-words select-text">
            {message.content}
          </div>
          <span className="text-[10px] text-theme-text-muted px-1">
            {formattedTime}
          </span>
        </div>
        <div className="size-7 rounded-full bg-theme-bg-surface border border-theme-border-subtle flex items-center justify-center text-theme-text-secondary shrink-0 mt-0.5 shadow-2xs">
          <User className="size-3.5" />
        </div>
      </div>
    );
  }

  // 2. Assistant Chat Message (Left-aligned with process timeline and response card)
  const effectiveSteps: AgentExecutionStep[] = message.steps && message.steps.length > 0
    ? message.steps
    : message.toolCalls && message.toolCalls.length > 0
    ? [
        {
          id: 'step_legacy_think',
          type: 'thinking',
          label: APP_CONTENT.process.thinking,
          status: 'completed',
          timestamp: message.timestamp,
        },
        ...message.toolCalls.map((t, idx) => ({
          id: `step_legacy_tool_${idx}`,
          type: 'tool' as const,
          toolName: t.toolName,
          label: t.toolName,
          status: 'completed' as const,
          timestamp: message.timestamp,
        })),
      ]
    : [];

  const hasSteps = effectiveSteps.length > 0;

  return (
    <div className="flex items-start gap-spacing-sm w-full max-w-[95%] py-1">
      {/* Argus Avatar */}
      <div className="size-7 rounded-full bg-theme-bg-surface border border-theme-border-subtle flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
        <ArgusIcon className="size-4 text-theme-brand-binance shrink-0" />
      </div>

      {/* Assistant Content Column */}
      <div className="flex-1 flex flex-col gap-spacing-xs min-w-0">
        {/* Header: Agent Role Label & Timestamp */}
        <div className="flex items-center gap-spacing-xs text-2xs text-theme-text-muted px-1">
          <span className="font-bold text-theme-text-primary tracking-wider">
            {APP_CONTENT.chat.agentRole}
          </span>
          <span>•</span>
          <span>{formattedTime}</span>
          {isError && (
            <span className="inline-flex items-center gap-1 text-2xs text-theme-status-danger font-semibold ml-1">
              <AlertCircle className="size-3 text-theme-status-danger" />
              {APP_CONTENT.chat.errorMessageTitle}
            </span>
          )}
        </div>

        {/* Collapsible Process Timeline (Thought for X steps ˇ) */}
        {hasSteps && (
          <AgentProcessTimeline steps={effectiveSteps} isStreaming={isStreaming} />
        )}

        {/* Main Response Markdown Container */}
        {message.content ? (
          <div
            className={`p-spacing-md rounded-2xl rounded-tl-xs shadow-2xs border text-xs leading-relaxed transition-all ${
              isError
                ? 'bg-theme-bg-surface border-theme-status-danger text-theme-status-danger'
                : 'bg-theme-bg-surface border-theme-border-subtle text-theme-text-primary'
            }`}
          >
            <MarkdownView content={message.content} />
            {isStreaming && (
              <span className="inline-block size-2 rounded-full bg-theme-brand-binance animate-ping ml-1" />
            )}
          </div>
        ) : isStreaming && !hasSteps ? (
          <div className="flex items-center gap-spacing-xs p-spacing-sm text-xs text-theme-text-muted italic bg-theme-bg-surface border border-theme-border-subtle rounded-2xl rounded-tl-xs w-fit">
            <Loader2 className="size-3.5 text-theme-brand-binance animate-spin" />
            <span>{APP_CONTENT.process.thinking}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
