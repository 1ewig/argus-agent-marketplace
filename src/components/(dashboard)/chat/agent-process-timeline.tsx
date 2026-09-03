'use client';

import React, { useState } from 'react';
import {
  Terminal,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Brain,
  AlertCircle,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { AgentExecutionStep } from '@/agent';

interface AgentProcessTimelineProps {
  steps: AgentExecutionStep[];
  isStreaming?: boolean;
}

/**
 * Renders the compact, collapsible reasoning and tool progression timeline.
 * Supports expandable reasoning text, tool arguments/results, and failure states.
 */
export function AgentProcessTimeline({
  steps,
  isStreaming = false,
}: AgentProcessTimelineProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [expandedDetailsIds, setExpandedDetailsIds] = useState<Record<string, boolean>>({});
  const [prevStreaming, setPrevStreaming] = useState<boolean>(isStreaming);

  // Automatically reopen timeline when a new stream starts
  if (isStreaming && !prevStreaming) {
    setPrevStreaming(true);
    setIsExpanded(true);
  } else if (!isStreaming && prevStreaming) {
    setPrevStreaming(false);
  }

  if (!steps || steps.length === 0) {
    return null;
  }

  const toggleDetails = (id: string) => {
    setExpandedDetailsIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const hasError = steps.some((s) => s.status === 'error');
  const isAllCompleted = !isStreaming && completedCount === steps.length;

  return (
    <div className="flex flex-col gap-spacing-xs text-2xs mb-spacing-xs">
      {/* Inline Collapsible Trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="inline-flex items-center gap-spacing-xs w-fit text-theme-text-muted hover:text-theme-text-primary py-0.5 cursor-pointer transition-colors group select-none"
      >
        {isStreaming ? (
          <Loader2 className="size-3 text-theme-brand-binance animate-spin shrink-0" />
        ) : hasError ? (
          <AlertCircle className="size-3 text-theme-status-danger shrink-0" />
        ) : isAllCompleted ? (
          <Sparkles className="size-3 text-theme-brand-binance shrink-0" />
        ) : (
          <Brain className="size-3 text-theme-brand-binance shrink-0" />
        )}

        <span className="font-mono text-2xs group-hover:underline">
          {APP_CONTENT.process.reasonedFor} {steps.length} {APP_CONTENT.process.stepSuffix}
        </span>

        {isExpanded ? (
          <ChevronUp className="size-3 text-theme-text-muted shrink-0" />
        ) : (
          <ChevronDown className="size-3 text-theme-text-muted shrink-0" />
        )}
      </button>

      {/* Expanded Step Tree */}
      {isExpanded && (
        <div className="ml-2 pl-spacing-sm border-l-2 border-theme-border-subtle flex flex-col gap-spacing-xs py-1 transition-all">
          {steps.map((step, idx) => {
            const isActive = step.status === 'active';
            const isCompleted = step.status === 'completed';
            const isStepError = step.status === 'error';
            const isTool = step.type === 'tool';
            const isDetailsOpen = Boolean(expandedDetailsIds[step.id]);

            const hasReasoning = Boolean(step.reasoningText?.trim());
            const hasToolData = Boolean(step.toolArgs || step.toolResult);
            const canExpand = isTool ? hasToolData : hasReasoning;

            return (
              <div key={step.id ?? `step_${idx}`} className="flex flex-col gap-0.5">
                {isTool ? (
                  /* Tool Pill with Status Badges */
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-spacing-xs py-0.5">
                      <button
                        type="button"
                        onClick={() => canExpand && toggleDetails(step.id)}
                        className={`inline-flex items-center gap-1.5 px-spacing-xs py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle font-mono text-theme-text-primary shadow-2xs ${canExpand
                            ? 'hover:border-theme-border-strong cursor-pointer'
                            : 'cursor-default'
                          }`}
                      >
                        <Terminal className="size-3 text-theme-brand-binance shrink-0" />
                        <span className="font-semibold">{step.toolName ?? step.label}</span>
                        {canExpand && (
                          isDetailsOpen ? <ChevronUp className="size-2.5 ml-0.5" /> : <ChevronDown className="size-2.5 ml-0.5" />
                        )}
                      </button>

                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-spacing-xs py-0.5 rounded text-2xs bg-theme-brand-binance/10 text-theme-brand-binance font-medium border border-theme-brand-binance/30 animate-pulse font-mono">
                          <Loader2 className="size-2.5 animate-spin" />
                          {APP_CONTENT.process.toolRunning}
                        </span>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-spacing-xs py-0.5 rounded text-2xs bg-theme-status-success/15 text-theme-status-success font-medium border border-theme-status-success/30 font-mono">
                          <Check className="size-2.5" />
                          {APP_CONTENT.process.successBadge}
                        </span>
                      )}

                      {isStepError && (
                        <span className="inline-flex items-center gap-1 px-spacing-xs py-0.5 rounded text-2xs bg-theme-status-danger/15 text-theme-status-danger font-medium border border-theme-status-danger/30 font-mono">
                          <AlertCircle className="size-2.5" />
                          {APP_CONTENT.process.toolFailed}
                        </span>
                      )}
                    </div>

                    {/* Tool Arguments/Results Drawer */}
                    {canExpand && isDetailsOpen && (
                      <div className="ml-2 p-spacing-sm rounded bg-theme-bg-surface border border-theme-border-subtle text-theme-text-secondary font-mono text-2xs leading-relaxed max-h-48 overflow-y-auto shadow-2xs whitespace-pre-wrap">
                        {Boolean(step.toolArgs) && (
                          <div className="mb-1">
                            <span className="text-theme-text-muted uppercase text-2xs block">{APP_CONTENT.process.toolArgumentsLabel}</span>
                            {JSON.stringify(step.toolArgs, null, 2)}
                          </div>
                        )}
                        {Boolean(step.toolResult) && (
                          <div>
                            <span className="text-theme-text-muted uppercase text-2xs block">{APP_CONTENT.process.toolResultLabel}</span>
                            {JSON.stringify(step.toolResult, null, 2)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Thinking Step with Dropdown */
                  <div className="flex flex-col gap-1 py-0.5">
                    <button
                      type="button"
                      onClick={() => canExpand && toggleDetails(step.id)}
                      className={`flex items-center gap-1.5 text-left transition-colors select-none w-fit ${canExpand
                          ? 'cursor-pointer group text-theme-text-secondary hover:text-theme-text-primary'
                          : 'cursor-default text-theme-text-muted'
                        }`}
                    >
                      <Brain className="size-3 text-theme-brand-binance shrink-0" />
                      <span
                        className={`font-mono ${isActive
                            ? 'text-theme-text-primary font-semibold'
                            : canExpand
                              ? 'text-theme-text-muted group-hover:underline'
                              : 'text-theme-text-muted'
                          }`}
                      >
                        {step.label}
                      </span>

                      {isActive && (
                        <span className="size-1.5 rounded-full bg-theme-brand-binance animate-ping ml-0.5" />
                      )}

                      {canExpand && (
                        <span className="inline-flex items-center gap-0.5 text-2xs text-theme-text-muted px-1.5 py-0.5 bg-theme-bg-surface border border-theme-border-subtle rounded group-hover:border-theme-border-strong font-mono transition-colors ml-1">
                          <span>
                            {isDetailsOpen
                              ? APP_CONTENT.process.hideReasoning
                              : APP_CONTENT.process.viewReasoning}
                          </span>
                          {isDetailsOpen ? (
                            <ChevronUp className="size-2.5" />
                          ) : (
                            <ChevronDown className="size-2.5" />
                          )}
                        </span>
                      )}
                    </button>

                    {/* Reasoning Details Drawer */}
                    {canExpand && isDetailsOpen && (
                      <div className="ml-4 p-spacing-sm rounded bg-theme-bg-surface border border-theme-border-subtle text-theme-text-secondary font-mono text-2xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto shadow-2xs">
                        {step.reasoningText?.trim()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}