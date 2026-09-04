'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { accordionVariants } from '@/constants/animation';
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

  // Live timer for active thinking phase
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(1);

  useEffect(() => {
    if (!isActive) return;
    const updateElapsed = () =>
      setElapsedSeconds(Math.max(1, Math.floor((Date.now() - step.timestamp) / 1000)));
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [isActive, step.timestamp]);

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
      {/* Collapsible Accordion Trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-theme-bg-elevated/70 border border-theme-border-subtle hover:border-theme-border-strong text-2xs text-theme-text-secondary hover:text-theme-text-primary transition-all cursor-pointer group select-none shadow-2xs w-fit"
      >
        {isActive ? (
          <Loader2 className="size-3 text-theme-brand-binance animate-spin shrink-0" />
        ) : isCompleted ? (
          <Sparkles className="size-3 text-theme-brand-binance shrink-0" />
        ) : (
          <Brain className="size-3 text-theme-brand-binance shrink-0" />
        )}

        <span className="text-2xs font-semibold text-theme-text-secondary group-hover:text-theme-text-primary">
          {headerLabel}
        </span>

        <ChevronDown
          className={`size-2.5 text-theme-text-muted group-hover:text-theme-text-primary transition-transform duration-200 ease-out shrink-0 ${
            isExpanded ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {/* Expanded Markdown Content with AnimatePresence & Height-Collapse */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            variants={accordionVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div className="pt-1.5 pb-0.5">
              <div className="pl-3.5 pr-2 py-2 max-h-72 overflow-y-auto rounded-xl bg-theme-bg-elevated/40 border border-theme-border-subtle text-xs text-theme-text-secondary leading-relaxed shadow-2xs">
                {reasoningText ? (
                  <MarkdownView content={reasoningText} />
                ) : isActive ? (
                  <div className="flex items-center gap-1.5 text-2xs text-theme-text-muted italic py-1">
                    <Loader2 className="size-2.5 animate-spin text-theme-brand-binance" />
                    <span>{APP_CONTENT.process.thinkingWithSeconds(elapsedSeconds)}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}