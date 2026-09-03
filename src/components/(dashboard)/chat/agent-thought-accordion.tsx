'use client';

import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { MarkdownView } from '../markdown-view';
import type { AgentExecutionStep } from '@/agent';

interface AgentThoughtAccordionProps {
  steps: AgentExecutionStep[];
  isStreaming?: boolean;
}

/**
 * Dedicated Thought Accordion rendering model reasoning with MarkdownView.
 * Separates internal model thinking from tool execution steps.
 */
export function AgentThoughtAccordion({
  steps,
  isStreaming = false,
}: AgentThoughtAccordionProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(isStreaming);
  const [prevStreaming, setPrevStreaming] = useState<boolean>(isStreaming);

  // Auto-expand when a new stream starts
  if (isStreaming && !prevStreaming) {
    setPrevStreaming(true);
    setIsExpanded(true);
  } else if (!isStreaming && prevStreaming) {
    setPrevStreaming(false);
  }

  const thinkingSteps = steps.filter((s) => s.type === 'thinking');
  if (thinkingSteps.length === 0) {
    return null;
  }

  const reasoningTexts = thinkingSteps
    .map((s) => s.reasoningText?.trim())
    .filter((t): t is string => Boolean(t && t.length > 0));

  const aggregatedReasoning = reasoningTexts.join('\n\n---\n\n');

  // If there's no text yet and not actively streaming, omit the accordion
  if (!aggregatedReasoning && !isStreaming) {
    return null;
  }

  const isThinkingActive = isStreaming && thinkingSteps.some((s) => s.status === 'active');
  const isCompleted = !isThinkingActive && aggregatedReasoning.length > 0;

  return (
    <div className="flex flex-col gap-spacing-xs text-2xs mb-spacing-xs">
      {/* Collapsible Accordion Trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="inline-flex items-center gap-spacing-xs w-fit text-theme-text-muted hover:text-theme-text-primary py-0.5 cursor-pointer transition-colors group select-none"
      >
        {isThinkingActive ? (
          <Loader2 className="size-3 text-theme-brand-binance animate-spin shrink-0" />
        ) : isCompleted ? (
          <Sparkles className="size-3 text-theme-brand-binance shrink-0" />
        ) : (
          <Brain className="size-3 text-theme-brand-binance shrink-0" />
        )}

        <span className="text-2xs font-medium group-hover:underline text-theme-text-secondary">
          {isThinkingActive ? APP_CONTENT.process.thinking : APP_CONTENT.process.thoughtProcess}
        </span>

        {isExpanded ? (
          <ChevronUp className="size-3 text-theme-text-muted shrink-0" />
        ) : (
          <ChevronDown className="size-3 text-theme-text-muted shrink-0" />
        )}
      </button>

      {/* Expanded Markdown Content */}
      {isExpanded && (
        <div className="pl-3 border-l-2 border-theme-brand-binance/40 py-1 max-h-72 overflow-y-auto transition-all">
          {aggregatedReasoning ? (
            <div className="text-xs text-theme-text-secondary leading-relaxed">
              <MarkdownView content={aggregatedReasoning} />
            </div>
          ) : isStreaming ? (
            <div className="flex items-center gap-1.5 text-2xs text-theme-text-muted italic py-1">
              <Loader2 className="size-2.5 animate-spin text-theme-brand-binance" />
              <span>{APP_CONTENT.process.thinking}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
