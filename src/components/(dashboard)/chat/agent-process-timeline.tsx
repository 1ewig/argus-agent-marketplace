'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bot,
} from 'lucide-react';
import { getToolDisplayInfo, ToolResultCard } from './tool-result-card';
import { AgentThoughtAccordion } from './agent-thought-accordion';
import { MarkdownView } from '../markdown-view';
import { APP_CONTENT } from '@/constants/content';
import { accordionVariants, tapScaleAccordion } from '@/constants/animation';
import type { AgentExecutionStep } from '@/agent';

interface AgentProcessTimelineProps {
  steps: AgentExecutionStep[];
  isStreaming?: boolean;
  isCompleted?: boolean;
  workedDurationMs?: number;
  startedAt?: number;
}

export const AgentProcessTimeline = memo(function AgentProcessTimeline({
  steps,
  isStreaming = false,
  isCompleted = false,
  workedDurationMs,
}: AgentProcessTimelineProps) {
  const [userToggledOpen, setUserToggledOpen] = useState<boolean | null>(null);
  const [expandedDetailsIds, setExpandedDetailsIds] = useState<Record<string, boolean>>({});

  const isActiveWork = isStreaming && !isCompleted;

  // Default is open while actively working, collapsed when completed, unless explicitly toggled
  const isOpen = userToggledOpen !== null ? userToggledOpen : !isCompleted;

  const toggleOpen = useCallback(() => {
    setUserToggledOpen((prev) => (prev !== null ? !prev : isCompleted));
  }, [isCompleted]);

  // Only display thinking steps that contain actual reasoning content
  const visibleSteps = useMemo(() => {
    if (!steps || steps.length === 0) return [];
    return steps.filter((step) => {
      if (step.type === 'thinking') {
        return Boolean(step.reasoningText?.trim());
      }
      return true;
    });
  }, [steps]);

  const toggleDetails = useCallback((id: string) => {
    setExpandedDetailsIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const finalWorkedSeconds = useMemo(() => {
    return Math.max(
      1,
      Math.round(
        (workedDurationMs ??
          (steps.length > 0
            ? steps[steps.length - 1].timestamp +
            (steps[steps.length - 1].durationMs ?? 1000) -
            steps[0].timestamp
            : 1000)) / 1000
      )
    );
  }, [workedDurationMs, steps]);

  const headerLabel = APP_CONTENT.process.workedForDuration(finalWorkedSeconds);

  if (visibleSteps.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col text-2xs mb-spacing-xs">
      {/* Overarching Worked Group Header (Shown at top only when completed) */}
      {!isActiveWork && (
        <motion.button
          type="button"
          whileTap={tapScaleAccordion}
          onClick={toggleOpen}
          className="inline-flex items-center gap-1.5 py-0.5 px-1 -ml-1 rounded-md hover:bg-theme-bg-elevated/40 active:bg-theme-bg-elevated/70 text-2xs text-theme-text-secondary hover:text-theme-text-primary select-none cursor-pointer transition-colors group w-fit"
        >
          <CheckCircle2 className="size-3 text-theme-brand-binance shrink-0" />
          <span className="font-medium text-theme-text-secondary group-hover:text-theme-text-primary">
            {headerLabel}
          </span>
          <ChevronDown
            className={`size-2.5 text-theme-text-muted group-hover:text-theme-text-primary transition-transform duration-200 ease-out shrink-0 ${isOpen ? 'rotate-180' : 'rotate-0'
              }`}
          />
        </motion.button>
      )}

      {/* Main Collapsible Inner Steps */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            variants={accordionVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            {/* Margins, border, and gaps live inside to prevent clipping/jitter during height animation */}
            <div className="flex flex-col gap-spacing-xs pl-3.5 border-l-2 border-theme-brand-binance/30 pt-2 pb-1">
              {visibleSteps.map((step, idx) => {
                if (step.type === 'thinking') {
                  return (
                    <AgentThoughtAccordion
                      key={step.id ?? `think_${idx}`}
                      step={step}
                      isStreaming={isStreaming}
                    />
                  );
                }

                if (step.type === 'intermediate_text') {
                  return (
                    <div
                      key={step.id ?? `interm_${idx}`}
                      className="flex flex-col gap-0.5 py-1 text-2xs text-theme-text-secondary"
                    >
                      <div className="flex items-center gap-1 text-theme-text-muted font-medium">
                        <Bot className="size-3 text-theme-brand-binance shrink-0" />
                        <span>{step.label || APP_CONTENT.process.intermediateUpdateLabel}</span>
                      </div>
                      <div className="pl-4 text-xs text-theme-text-secondary leading-relaxed select-text">
                        <MarkdownView content={step.intermediateText || ''} />
                      </div>
                    </div>
                  );
                }

                const isActive = step.status === 'active' && !isCompleted;
                const isStepError = step.status === 'error' || (step.status === 'active' && isCompleted);
                const isDetailsOpen = Boolean(expandedDetailsIds[step.id]);
                const effectiveToolResult =
                  step.toolResult ??
                  (isStepError
                    ? { success: false, error: APP_CONTENT.process.results.errorTitle }
                    : undefined);
                const hasToolData = Boolean(step.toolArgs || effectiveToolResult);

                const displayInfo = getToolDisplayInfo(step.toolName, step.toolArgs);
                const ToolIcon = displayInfo.icon;

                return (
                  <div key={step.id ?? `tool_${idx}`} className="flex flex-col gap-0.5">
                    <div className="flex flex-col py-0.5">
                      <div className="flex flex-wrap items-center gap-spacing-xs py-0.5">
                        <motion.button
                          type="button"
                          whileTap={hasToolData ? tapScaleAccordion : undefined}
                          onClick={() => hasToolData && toggleDetails(step.id)}
                          className={`flex items-center gap-1.5 text-left transition-colors select-none w-fit py-0.5 px-1 -ml-1 rounded-md ${hasToolData
                              ? 'cursor-pointer group text-theme-text-secondary hover:text-theme-text-primary active:bg-theme-bg-elevated/60'
                              : 'cursor-default text-theme-text-muted'
                            }`}
                        >
                          {isActive ? (
                            <Loader2 className="size-3 text-theme-brand-binance animate-spin shrink-0" />
                          ) : isStepError ? (
                            <AlertCircle className="size-3 text-theme-status-danger shrink-0" />
                          ) : (
                            <ToolIcon className="size-3 text-theme-brand-binance shrink-0" />
                          )}
                          <span
                            className={`text-2xs ${isActive
                                ? 'text-theme-text-primary font-semibold'
                                : isStepError
                                  ? 'text-theme-status-danger font-medium'
                                  : hasToolData
                                    ? 'text-theme-text-secondary group-hover:text-theme-text-primary font-medium'
                                    : 'text-theme-text-muted'
                              }`}
                          >
                            {displayInfo.title}
                          </span>
                          {hasToolData && (
                            <ChevronDown
                              className={`size-2.5 text-theme-text-muted group-hover:text-theme-text-primary transition-transform duration-200 ease-out shrink-0 ${isDetailsOpen ? 'rotate-180' : 'rotate-0'
                                }`}
                            />
                          )}
                        </motion.button>
                      </div>

                      {/* Tool Arguments/Results Drawer — Now with AnimatePresence & pure height-collapse */}
                      <AnimatePresence initial={false}>
                        {hasToolData && isDetailsOpen && (
                          <motion.div
                            variants={accordionVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            className="overflow-hidden"
                          >
                            <div className="ml-4 pt-1.5 pb-0.5">
                              <ToolResultCard
                                toolName={step.toolName}
                                toolArgs={step.toolArgs}
                                toolResult={effectiveToolResult}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});