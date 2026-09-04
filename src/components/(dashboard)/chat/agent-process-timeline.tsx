'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getToolDisplayInfo, ToolResultCard } from './tool-result-card';
import { AgentThoughtAccordion } from './agent-thought-accordion';
import type { AgentExecutionStep } from '@/agent';

interface AgentProcessTimelineProps {
  steps: AgentExecutionStep[];
  isStreaming?: boolean;
}

/**
 * Renders the autonomous reasoning and tool progression in chronological order.
 * Thinking phases render via AgentThoughtAccordion with MarkdownView.
 * Tools render inline with contextual icons and expandable result cards.
 */
export function AgentProcessTimeline({
  steps,
  isStreaming = false,
}: AgentProcessTimelineProps) {
  const [expandedDetailsIds, setExpandedDetailsIds] = useState<Record<string, boolean>>({});

  if (!steps || steps.length === 0) {
    return null;
  }

  // Filter out completed thinking steps that have no reasoning text
  const visibleSteps = steps.filter((step) => {
    if (step.type === 'thinking') {
      const hasText = Boolean(step.reasoningText?.trim());
      const isActive = isStreaming && step.status === 'active';
      return hasText || isActive;
    }
    return true; // tool steps
  });

  if (visibleSteps.length === 0) {
    return null;
  }

  const toggleDetails = (id: string) => {
    setExpandedDetailsIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="flex flex-col gap-spacing-xs text-2xs mb-spacing-xs">
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

        const isActive = step.status === 'active';
        const isStepError = step.status === 'error';
        const isDetailsOpen = Boolean(expandedDetailsIds[step.id]);
        const hasToolData = Boolean(step.toolArgs || step.toolResult);

        const displayInfo = getToolDisplayInfo(step.toolName, step.toolArgs);
        const ToolIcon = displayInfo.icon;

        return (
          <div key={step.id ?? `tool_${idx}`} className="flex flex-col gap-0.5">
            <div className="flex flex-col gap-1 py-0.5">
              <div className="flex flex-wrap items-center gap-spacing-xs py-0.5">
                <button
                  type="button"
                  onClick={() => hasToolData && toggleDetails(step.id)}
                  className={`flex items-center gap-1.5 text-left transition-colors select-none w-fit ${hasToolData
                      ? 'cursor-pointer group text-theme-text-secondary hover:text-theme-text-primary'
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
                    isDetailsOpen ? (
                      <ChevronUp className="size-2.5 text-theme-text-muted group-hover:text-theme-text-primary transition-colors" />
                    ) : (
                      <ChevronDown className="size-2.5 text-theme-text-muted group-hover:text-theme-text-primary transition-colors" />
                    )
                  )}
                </button>
              </div>

              {/* Tool Arguments/Results Drawer */}
              {hasToolData && isDetailsOpen && (
                <div className="ml-4 pt-1">
                  <ToolResultCard
                    toolName={step.toolName}
                    toolArgs={step.toolArgs}
                    toolResult={step.toolResult}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}