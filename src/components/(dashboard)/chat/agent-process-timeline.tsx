'use client';

import React, { useState } from 'react';
import { Terminal, Check, ChevronDown, ChevronUp, Loader2, Sparkles, Brain } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { AgentExecutionStep } from '@/agent';

interface AgentProcessTimelineProps {
  steps: AgentExecutionStep[];
  isStreaming?: boolean;
}

/**
 * Renders the compact, collapsible reasoning and tool progression timeline.
 * Inspired by modern agentic chat interfaces (like Strata AI):
 * - Clean minimal inline trigger: "Reasoned for X steps ˇ"
 * - Indented step tree when expanded with clean tool pills & success badges.
 * - Interactive dropdown to inspect the agent's internal reasoning thoughts for each thinking step.
 */
export function AgentProcessTimeline({
  steps,
  isStreaming = false,
}: AgentProcessTimelineProps) {
  // While streaming, keep open so user watches the live thinking and tools;
  // after stream finishes, user can toggle open/close.
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [expandedReasoningIds, setExpandedReasoningIds] = useState<Record<string, boolean>>({});

  if (!steps || steps.length === 0) {
    return null;
  }

  const toggleReasoning = (id: string) => {
    setExpandedReasoningIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const isAllCompleted = !isStreaming && completedCount === steps.length;

  return (
    <div className="flex flex-col gap-spacing-xs text-2xs mb-spacing-xs">
      {/* Inline Collapsible Trigger matching Strata AI style */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="inline-flex items-center gap-spacing-xs w-fit text-theme-text-muted hover:text-theme-text-primary py-0.5 cursor-pointer transition-colors group select-none"
      >
        {isStreaming ? (
          <Loader2 className="size-3 text-theme-brand-binance animate-spin shrink-0" />
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

      {/* Expanded Indented Step Tree */}
      {isExpanded && (
        <div className="ml-2 pl-spacing-sm border-l-2 border-theme-border-subtle flex flex-col gap-spacing-xs py-1 transition-all">
          {steps.map((step, idx) => {
            const isActive = step.status === 'active';
            const isCompleted = step.status === 'completed';
            const isTool = step.type === 'tool';
            const isReasoningOpen = Boolean(expandedReasoningIds[step.id]);
            const hasReasoning = Boolean(step.reasoningText && step.reasoningText.trim().length > 0);

            return (
              <div key={step.id ?? `step_${idx}`} className="flex flex-col gap-0.5">
                {isTool ? (
                  /* Tool Pill with Status Badge */
                  <div className="flex flex-wrap items-center gap-spacing-xs py-0.5">
                    <div className="inline-flex items-center gap-1.5 px-spacing-xs py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle text-theme-text-primary font-mono font-semibold shadow-2xs">
                      <Terminal className="size-3 text-theme-brand-binance shrink-0" />
                      <span>{step.toolName ?? step.label}</span>
                    </div>

                    {isActive && (
                      <span className="inline-flex items-center gap-1 px-spacing-xs py-0.5 rounded text-[10px] bg-theme-brand-binance/10 text-theme-brand-binance font-medium border border-theme-brand-binance/30 animate-pulse font-mono">
                        <Loader2 className="size-2.5 animate-spin" />
                        {APP_CONTENT.process.toolRunning}
                      </span>
                    )}

                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-spacing-xs py-0.5 rounded text-[10px] bg-theme-status-success/15 text-theme-status-success font-medium border border-theme-status-success/30 font-mono">
                        <Check className="size-2.5" />
                        {APP_CONTENT.process.successBadge}
                      </span>
                    )}
                  </div>
                ) : (
                  /* Thinking Step with Dropdown for Reasoning */
                  <div className="flex flex-col gap-1 py-0.5">
                    <button
                      type="button"
                      onClick={() => hasReasoning && toggleReasoning(step.id)}
                      className={`flex items-center gap-1.5 text-left transition-colors select-none w-fit ${
                        hasReasoning
                          ? 'cursor-pointer group text-theme-text-secondary hover:text-theme-text-primary'
                          : 'cursor-default text-theme-text-muted'
                      }`}
                    >
                      <Brain className="size-3 text-theme-brand-binance shrink-0" />
                      <span
                        className={`font-mono ${
                          isActive
                            ? 'text-theme-text-primary font-semibold'
                            : hasReasoning
                            ? 'text-theme-text-muted group-hover:underline'
                            : 'text-theme-text-muted'
                        }`}
                      >
                        {step.label}
                      </span>

                      {isActive && (
                        <span className="size-1.5 rounded-full bg-theme-brand-binance animate-ping ml-0.5" />
                      )}

                      {/* Dropdown Toggle Badge when reasoning thoughts exist */}
                      {hasReasoning && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-theme-text-muted px-1.5 py-0.5 bg-theme-bg-surface border border-theme-border-subtle rounded group-hover:border-theme-border-strong font-mono transition-colors ml-1">
                          <span>
                            {isReasoningOpen
                              ? APP_CONTENT.process.hideReasoning
                              : APP_CONTENT.process.viewReasoning}
                          </span>
                          {isReasoningOpen ? (
                            <ChevronUp className="size-2.5" />
                          ) : (
                            <ChevronDown className="size-2.5" />
                          )}
                        </span>
                      )}
                    </button>

                    {/* Reasoning Thoughts Dropdown Drawer */}
                    {hasReasoning && isReasoningOpen && (
                      <div className="ml-4 p-spacing-sm rounded bg-theme-bg-surface border border-theme-border-subtle text-theme-text-secondary font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto shadow-2xs">
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
