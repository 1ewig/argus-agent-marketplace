'use client';

import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { MarkdownView } from '../markdown-view';
import type { AgentExecutionStep } from '@/agent';

interface AgentThoughtAccordionProps {
  step: AgentExecutionStep;
  isStreaming?: boolean;
}

/**
 * Dedicated Thought Accordion rendering a single reasoning phase with MarkdownView.
 * Ensures multi-turn agent thinking steps render chronologically without merging.
 */
export function AgentThoughtAccordion({
  step,
  isStreaming = false,
}: AgentThoughtAccordionProps) {
  const isActive = isStreaming && step.status === 'active';
  const reasoningText = step.reasoningText?.trim() || '';

  const [isExpanded, setIsExpanded] = useState<boolean>(isActive);
  const [prevActive, setPrevActive] = useState<boolean>(isActive);

  // Auto-expand when this specific thinking phase starts streaming
  if (isActive && !prevActive) {
    setPrevActive(true);
    setIsExpanded(true);
  } else if (!isActive && prevActive) {
    setPrevActive(false);
    setIsExpanded(false);
  }

  // If there's no text yet and this phase is not actively streaming, omit it
  if (!reasoningText && !isActive) {
    return null;
  }

  const isCompleted = !isActive && reasoningText.length > 0;

  return (
    <div className="flex flex-col gap-spacing-xs text-2xs mb-spacing-xs">
      {/* Collapsible Accordion Trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="inline-flex items-center gap-spacing-xs w-fit text-theme-text-muted hover:text-theme-text-primary py-0.5 cursor-pointer transition-colors group select-none"
      >
        {isActive ? (
          <Loader2 className="size-3 text-theme-brand-binance animate-spin shrink-0" />
        ) : isCompleted ? (
          <Sparkles className="size-3 text-theme-brand-binance shrink-0" />
        ) : (
          <Brain className="size-3 text-theme-brand-binance shrink-0" />
        )}

        <span className="text-2xs font-medium group-hover:underline text-theme-text-secondary">
          {isActive ? APP_CONTENT.process.thinking : APP_CONTENT.process.thoughtProcess}
        </span>

        {isExpanded ? (
          <ChevronUp className="size-3 text-theme-text-muted shrink-0" />
        ) : (
          <ChevronDown className="size-3 text-theme-text-muted shrink-0" />
        )}
      </button>

      {/* Expanded Markdown Content (Indented slightly to the right without the line) */}
      {isExpanded && (
        <div className="pl-5 py-1 max-h-72 overflow-y-auto transition-all">
          {reasoningText ? (
            <div className="text-xs text-theme-text-secondary leading-relaxed">
              <MarkdownView content={reasoningText} />
            </div>
          ) : isActive ? (
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