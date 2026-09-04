'use client';

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { accordionVariants } from '@/constants/animation';
import { useActiveTimer } from '@/hooks';
import { MarkdownView } from '../markdown-view';
import type { AgentExecutionStep } from '@/agent';

interface AgentThoughtAccordionProps {
  step: AgentExecutionStep;
  isStreaming?: boolean;
}

/**
 * Dedicated Thought Accordion rendering a single reasoning phase with MarkdownView.
 * Ensures multi-turn agent thinking steps render chronologically without merging.
 * Memoized to prevent re-rendering when other stream steps update.
 */
export const AgentThoughtAccordion = memo(function AgentThoughtAccordion({
  step,
  isStreaming = false,
}: AgentThoughtAccordionProps) {
  const isActive = isStreaming && step.status === 'active';
  const reasoningText = step.reasoningText?.trim() || '';

  // Clean user toggle without setState side-effects during render phase
  const [userToggled, setUserToggled] = useState<boolean | null>(null);
  const isExpanded = userToggled !== null ? userToggled : isActive;

  // Unified synchronized timer that only runs while actively thinking
  const elapsedSeconds = useActiveTimer(step.timestamp, isActive);

  // If there's no text yet and this phase is not actively streaming, omit it
  if (!reasoningText && !isActive) {
    return null;
  }

  const isCompleted = !isActive && (reasoningText.length > 0 || Boolean(step.durationMs));

  // Compute final thought duration in seconds without calling impure Date.now() during render
  const completedDurationSeconds = Math.max(
    1,
    step.durationMs ? Math.round(step.durationMs / 1000) : elapsedSeconds
  );

  const headerLabel = isActive
    ? APP_CONTENT.process.thinkingWithSeconds(elapsedSeconds)
    : APP_CONTENT.process.thoughtForDuration(completedDurationSeconds);

  return (
    <div className="flex flex-col text-2xs py-0.5">
      {/* Clean Accordion Trigger (Box container removed) */}
      <button
        type="button"
        onClick={() => setUserToggled(!isExpanded)}
        className="inline-flex items-center gap-1.5 py-0.5 text-2xs text-theme-text-secondary hover:text-theme-text-primary transition-colors cursor-pointer group select-none w-fit"
      >
        {isActive ? (
          <Loader2 className="size-3 text-theme-brand-binance animate-spin shrink-0" />
        ) : isCompleted ? (
          <Sparkles className="size-3 text-theme-brand-binance shrink-0" />
        ) : (
          <Brain className="size-3 text-theme-brand-binance shrink-0" />
        )}

        <span className="text-2xs font-medium text-theme-text-secondary group-hover:text-theme-text-primary">
          {headerLabel}
        </span>

        <ChevronDown
          className={`size-2.5 text-theme-text-muted group-hover:text-theme-text-primary transition-transform duration-200 ease-out shrink-0 ${isExpanded ? 'rotate-180' : 'rotate-0'
            }`}
        />
      </button>

      {/* Expanded Markdown Content (Card container removed, indented naturally) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            variants={accordionVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div className="pl-4 py-1 max-h-72 overflow-y-auto text-xs text-theme-text-secondary leading-relaxed select-text">
              {reasoningText ? (
                <MarkdownView content={reasoningText} />
              ) : isActive ? (
                <div className="flex items-center gap-1.5 text-2xs text-theme-text-muted italic py-0.5">
                  <Loader2 className="size-2.5 animate-spin text-theme-brand-binance" />
                  <span>{APP_CONTENT.process.thinkingWithSeconds(elapsedSeconds)}</span>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});