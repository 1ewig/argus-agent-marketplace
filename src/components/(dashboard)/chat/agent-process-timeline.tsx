'use client';

import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { getToolDisplayInfo, ToolResultCard } from './tool-result-card';
import type { AgentExecutionStep } from '@/agent';

interface AgentProcessTimelineProps {
  steps: AgentExecutionStep[];
  isStreaming?: boolean;
}

/**
 * Renders the autonomous tool progression directly in line.
 * Each tool can be expanded individually to inspect its structured result card.
 */
export function AgentProcessTimeline({
  steps,
}: AgentProcessTimelineProps) {
  const [expandedDetailsIds, setExpandedDetailsIds] = useState<Record<string, boolean>>({});

  const toolSteps = steps.filter((s) => s.type === 'tool');

  if (toolSteps.length === 0) {
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
      {toolSteps.map((step, idx) => {
        const isActive = step.status === 'active';
        const isCompleted = step.status === 'completed';
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
                  <ToolIcon className="size-3 text-theme-brand-binance shrink-0" />
                  <span
                    className={`text-2xs ${isActive
                        ? 'text-theme-text-primary font-semibold'
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