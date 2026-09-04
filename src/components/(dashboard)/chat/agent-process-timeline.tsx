'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bot,
} from 'lucide-react';
import { getToolDisplayInfo, ToolResultCard } from './tool-result-card';
import { AgentThoughtAccordion } from './agent-thought-accordion';
import { MarkdownView } from '../markdown-view';
import { APP_CONTENT } from '@/constants/content';
import type { AgentExecutionStep } from '@/agent';

interface AgentProcessTimelineProps {
  steps: AgentExecutionStep[];
  isStreaming?: boolean;
  isCompleted?: boolean;
  workedDurationMs?: number;
  startedAt?: number;
}

/**
 * Renders the autonomous reasoning, intermediate text, and tool progression
 * wrapped inside a unified "Worked for # seconds" / "Working (#s)" group.
 * 
 * - While actively working: displays "Working (#s)" with live timer and stays open.
 * - When completed: displays "Worked for # seconds" and collapses by default.
 * - Supports inspecting inner thoughts, tool arguments, and intermediate model outputs.
 */
export function AgentProcessTimeline({
  steps,
  isStreaming = false,
  isCompleted = false,
  workedDurationMs,
  startedAt,
}: AgentProcessTimelineProps) {
  const [userToggledOpen, setUserToggledOpen] = useState<boolean | null>(null);
  const [expandedDetailsIds, setExpandedDetailsIds] = useState<Record<string, boolean>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(1);

  // Default is open while actively working, collapsed when completed, unless explicitly toggled
  const isOpen = userToggledOpen !== null ? userToggledOpen : !isCompleted;

  const toggleOpen = () => {
    setUserToggledOpen(!isOpen);
  };

  // Live timer for active working state
  useEffect(() => {
    if (isCompleted || !isStreaming || !startedAt) return;
    const update = () =>
      setElapsedSeconds(Math.max(1, Math.floor((Date.now() - startedAt) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [isCompleted, isStreaming, startedAt]);

  if (!steps || steps.length === 0) {
    return null;
  }

  // Only display thinking steps that contain actual reasoning content
  const visibleSteps = steps.filter((step) => {
    if (step.type === 'thinking') {
      return Boolean(step.reasoningText?.trim());
    }
    return true; // tool steps and intermediate text steps
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

  // Calculate final worked seconds cleanly
  const finalWorkedSeconds = Math.max(
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

  const isActiveWork = isStreaming && !isCompleted;
  const headerLabel = isActiveWork
    ? APP_CONTENT.process.workingWithSeconds(elapsedSeconds)
    : APP_CONTENT.process.workedForDuration(finalWorkedSeconds);

  return (
    <div className="flex flex-col gap-1 text-2xs mb-spacing-xs">
      {/* Overarching Worked Group Header (Shown at top only when completed) */}
      {!isActiveWork && (
        <button
          type="button"
          onClick={toggleOpen}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-theme-bg-elevated border border-theme-border-subtle hover:border-theme-border-strong text-2xs text-theme-text-secondary hover:text-theme-text-primary select-none cursor-pointer transition-all shadow-2xs group w-fit"
        >
          <CheckCircle2 className="size-3 text-theme-brand-binance shrink-0" />
          <span className="font-semibold text-theme-text-secondary group-hover:text-theme-text-primary">
            {headerLabel}
          </span>
          {isOpen ? (
            <ChevronUp className="size-2.5 text-theme-text-muted group-hover:text-theme-text-primary transition-colors shrink-0" />
          ) : (
            <ChevronDown className="size-2.5 text-theme-text-muted group-hover:text-theme-text-primary transition-colors shrink-0" />
          )}
        </button>
      )}

      {/* Collapsible Inner Steps */}
      {isOpen && (
        <div className="flex flex-col gap-spacing-xs pl-3.5 border-l-2 border-theme-brand-binance/30 mt-1 mb-1.5 transition-all">
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
                  <div className="pl-4 text-xs text-theme-text-secondary leading-relaxed">
                    <MarkdownView content={step.intermediateText || ''} />
                  </div>
                </div>
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
      )}

      {/* Active Running State: Working indicator moved to the bottom */}
      {isActiveWork && (
        <button
          type="button"
          onClick={toggleOpen}
          className="flex items-center gap-1.5 text-2xs text-theme-text-muted hover:text-theme-text-primary py-0.5 select-none cursor-pointer transition-colors w-fit group mt-0.5"
        >
          <Loader2 className="size-3 text-theme-brand-binance animate-spin shrink-0" />
          <span className="font-medium text-theme-text-secondary group-hover:underline">
            {headerLabel}
          </span>
          {isOpen ? (
            <ChevronUp className="size-2.5 text-theme-text-muted group-hover:text-theme-text-primary transition-colors shrink-0" />
          ) : (
            <ChevronDown className="size-2.5 text-theme-text-muted group-hover:text-theme-text-primary transition-colors shrink-0" />
          )}
        </button>
      )}
    </div>
  );
}