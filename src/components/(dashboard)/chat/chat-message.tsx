'use client';

import React, { useState } from 'react';
import { User, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { ArgusIcon } from '../argus-icon';
import { APP_CONTENT } from '@/constants/content';
import { MarkdownView } from '../markdown-view';
import type { ExecutedToolCall } from '@/agent';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ExecutedToolCall[];
  stepCount?: number;
  timestamp: number;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const isUser = message.role === 'user';
  const hasToolCalls = Boolean(message.toolCalls && message.toolCalls.length > 0);

  return (
    <div
      className={`flex flex-col gap-spacing-xs p-spacing-md rounded-lg shadow-2xs border ${
        isUser
          ? 'bg-theme-bg-elevated border-theme-border-subtle'
          : 'bg-theme-bg-surface border-theme-border-strong'
      }`}
    >
      {/* Header bar: Avatar, Role Badge, Timestamp */}
      <div className="flex items-center justify-between gap-spacing-sm">
        <div className="flex items-center gap-spacing-xs">
          {isUser ? (
            <div className="flex items-center justify-center rounded p-spacing-xs bg-theme-bg-surface text-theme-text-secondary border border-theme-border-subtle">
              <User className="size-4" />
            </div>
          ) : (
            <ArgusIcon className="size-4 text-theme-brand-binance shrink-0" />
          )}
          <span className="text-2xs font-bold tracking-wider">
            {isUser ? APP_CONTENT.chat.userRole : APP_CONTENT.chat.agentRole}
          </span>
          {!isUser && message.stepCount !== undefined && message.stepCount > 0 && (
            <span className="text-2xs bg-theme-bg-elevated text-theme-text-muted px-spacing-xs rounded border border-theme-border-subtle">
              {message.stepCount} {APP_CONTENT.chat.stepCountLabel}
            </span>
          )}
        </div>
        <span className="text-2xs text-theme-text-muted">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Message Body Content rendered with Markdown */}
      <div className="py-spacing-xs">
        <MarkdownView content={message.content} />
      </div>

      {/* Executed Binance MCP Tools Section */}
      {hasToolCalls && (
        <div className="mt-spacing-xs border-t border-theme-border-subtle pt-spacing-xs">
          <button
            type="button"
            onClick={() => setToolsExpanded((prev) => !prev)}
            className="flex items-center justify-between w-full text-left text-2xs font-medium text-theme-text-secondary hover:text-theme-text-primary py-spacing-xs cursor-pointer"
          >
            <div className="flex items-center gap-spacing-xs">
              <Terminal className="size-3 text-theme-brand-binance" />
              <span>
                {APP_CONTENT.chat.toolCallsLabel} ({message.toolCalls?.length} {APP_CONTENT.chat.toolCallsCountSuffix})
              </span>
            </div>
            <div className="flex items-center gap-spacing-xs text-theme-text-muted">
              <span>{toolsExpanded ? APP_CONTENT.chat.hideDetails : APP_CONTENT.chat.viewDetails}</span>
              {toolsExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </div>
          </button>

          {toolsExpanded && (
            <div className="flex flex-col gap-spacing-xs mt-spacing-xs">
              {message.toolCalls?.map((call, idx) => (
                <div
                  key={`${call.toolName}-${idx}`}
                  className="bg-theme-bg-elevated p-spacing-xs rounded border border-theme-border-subtle text-2xs font-mono"
                >
                  <div className="flex items-center justify-between text-theme-text-primary font-bold">
                    <span>{call.toolName}</span>
                  </div>
                  {call.args && Object.keys(call.args).length > 0 && (
                    <div className="mt-spacing-xs text-theme-text-secondary">
                      <pre className="overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(call.args, null, 2)}
                      </pre>
                    </div>
                  )}
                  {call.result !== undefined && (
                    <div className="mt-spacing-xs border-t border-theme-border-subtle pt-spacing-xs text-theme-status-info">
                      <pre className="overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(call.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
