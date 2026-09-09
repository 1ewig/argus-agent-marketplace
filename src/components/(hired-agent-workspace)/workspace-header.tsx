'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Zap,
  Play,
  Pause,
  Trash2,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import type { HiringStatus } from '@/lib/types';

export interface WorkspaceHeaderProps {
  name: string;
  agentTokenId: string;
  isActive: boolean;
  isCycling: boolean;
  status?: HiringStatus;
  onTriggerCycle: () => void;
  onToggleStatus: () => void;
  onTerminate: () => void;
  onDelete?: () => void;
}

export const WorkspaceHeader = memo(function WorkspaceHeader({
  name,
  agentTokenId,
  isActive,
  isCycling,
  status,
  onTriggerCycle,
  onToggleStatus,
  onTerminate,
  onDelete,
}: WorkspaceHeaderProps) {
  const isTerminated = status === 'terminated';
  return (
    <header className="w-full bg-theme-bg-surface/90 backdrop-blur-md border-b border-theme-border-subtle shrink-0 z-20 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
      {/* Breadcrumb & Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/marketplace"
          className="h-8 px-2.5 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle hover:border-theme-brand-binance/50 text-theme-text-secondary hover:text-theme-text-primary text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden sm:inline">
            {APP_CONTENT.hiredAgents.workspace.breadcrumbMarketplace}
          </span>
        </Link>

        <span className="text-theme-border-subtle">/</span>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-theme-text-primary truncate">
            {name}
          </span>
          <span className="font-mono text-xs font-medium text-theme-brand-binance">
            #{agentTokenId}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Manual Run Cycle */}
        <motion.button
          type="button"
          whileTap={isActive && !isTerminated ? tapScalePill : undefined}
          disabled={!isActive || isCycling || isTerminated}
          onClick={onTriggerCycle}
          className={`h-8 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isTerminated
              ? 'bg-theme-bg-elevated/40 border-theme-border-subtle/40 text-theme-text-muted/40 cursor-not-allowed'
              : 'bg-theme-bg-elevated border-theme-border-subtle hover:border-theme-brand-binance text-theme-text-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          <Zap
            className={`size-3.5 ${
              isCycling
                ? 'animate-spin text-theme-brand-binance'
                : isTerminated
                  ? 'text-theme-text-muted/40'
                  : ''
            }`}
          />
          <span className="hidden sm:inline">
            {isCycling
              ? APP_CONTENT.hiredAgents.workspace.actions.runningCycle
              : APP_CONTENT.hiredAgents.workspace.actions.runCycleNow}
          </span>
        </motion.button>

        {/* Pause / Resume */}
        <motion.button
          type="button"
          whileTap={!isTerminated ? tapScalePill : undefined}
          disabled={isTerminated}
          onClick={onToggleStatus}
          className={`h-8 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isTerminated
              ? 'bg-theme-bg-elevated/40 border-theme-border-subtle/40 text-theme-text-muted/40 cursor-not-allowed'
              : isActive
                ? 'bg-theme-bg-elevated border-theme-border-subtle hover:border-theme-status-warning text-theme-text-secondary hover:text-theme-status-warning cursor-pointer'
                : 'bg-theme-status-success/15 border-theme-status-success/30 text-theme-status-success hover:bg-theme-status-success/25 cursor-pointer'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="size-3.5" />
              <span className="hidden sm:inline">
                {APP_CONTENT.hiredAgents.workspace.actions.pauseAgent}
              </span>
            </>
          ) : (
            <>
              <Play className="size-3.5" />
              <span className="hidden sm:inline">
                {APP_CONTENT.hiredAgents.workspace.actions.resumeAgent}
              </span>
            </>
          )}
        </motion.button>

        {/* Terminate or Delete Record Button */}
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={isTerminated ? (onDelete ?? onTerminate) : onTerminate}
          title={
            isTerminated
              ? APP_CONTENT.hiredAgents.workspace.actions.deleteAgent
              : APP_CONTENT.hiredAgents.workspace.actions.terminateAgent
          }
          className="size-8 rounded-lg bg-theme-bg-elevated hover:bg-theme-status-danger/15 border border-theme-border-subtle hover:border-theme-status-danger/40 text-theme-text-muted hover:text-theme-status-danger flex items-center justify-center cursor-pointer transition-colors"
        >
          <Trash2 className="size-3.5" />
        </motion.button>
      </div>
    </header>
  );
});
