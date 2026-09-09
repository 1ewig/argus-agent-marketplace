'use client';

import React, { memo, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  X,
  Play,
  Pause,
  ArrowUpRight,
  Bot,
  Zap,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import {
  db,
  seedInitialHiredAgents,
  updateHiredAgentStatus,
  triggerAgentExecutionCycle,
} from '@/lib/db';
import type { HiredAgentRecord } from '@/lib/types';

export interface HiredAgentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAgent?: (id: string) => void;
}

export const HiredAgentsPanel = memo(function HiredAgentsPanel({
  isOpen,
  onClose,
  onSelectAgent,
}: HiredAgentsPanelProps) {
  const router = useRouter();
  const [cyclingAgentId, setCyclingAgentId] = useState<string | null>(null);

  // Auto-seed demo agents on first launch
  useEffect(() => {
    seedInitialHiredAgents();
  }, []);

  // Reactive live query from IndexedDB
  const hiredAgents = useLiveQuery(async () => {
    return await db.hiredAgents.orderBy('lastActiveAt').reverse().toArray();
  }, []) as HiredAgentRecord[] | undefined;

  const activeAgents = (hiredAgents ?? []).filter((a) => a.status === 'active');
  const totalAgentsCount = hiredAgents?.length ?? 0;

  const handleToggleStatus = useCallback(
    async (agent: HiredAgentRecord, e: React.MouseEvent) => {
      e.stopPropagation();
      const nextStatus = agent.status === 'active' ? 'paused' : 'active';
      await updateHiredAgentStatus(agent.id, nextStatus);
    },
    [],
  );

  const handleTriggerCycle = useCallback(
    async (agentId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setCyclingAgentId(agentId);
      try {
        await triggerAgentExecutionCycle(agentId);
      } finally {
        setTimeout(() => setCyclingAgentId(null), 400);
      }
    },
    [],
  );

  const handleNavigateToAgent = useCallback(
    (agentId: string) => {
      if (onSelectAgent) {
        onSelectAgent(agentId);
      } else {
        router.push(`/marketplace/hired/${agentId}`);
      }
    },
    [onSelectAgent, router],
  );

  if (!isOpen) return null;

  return (
    <aside className="w-full lg:w-96 xl:w-104 bg-theme-bg-surface border-l border-theme-border-subtle shrink-0 flex flex-col h-full z-20 overflow-hidden shadow-xl lg:shadow-none">
      {/* 1. Panel Header */}
      <div className="h-14 px-4 sm:px-5 border-b border-theme-border-subtle flex items-center justify-between gap-3 bg-theme-bg-surface shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-theme-brand-binance/10 border border-theme-brand-binance/25 flex items-center justify-center text-theme-brand-binance shrink-0">
            <Bot className="size-4" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-theme-text-primary tracking-tight truncate">
                {APP_CONTENT.hiredAgents.panel.title}
              </h2>
              <span className="text-3xs font-extrabold px-1.5 py-0.5 rounded-full bg-theme-status-success/15 text-theme-status-success border border-theme-status-success/30 font-mono">
                {activeAgents.length} Active
              </span>
            </div>
            <span className="text-3xs text-theme-text-muted truncate">
              {APP_CONTENT.hiredAgents.panel.subtitle(activeAgents.length, totalAgentsCount)}
            </span>
          </div>
        </div>

        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onClose}
          title={APP_CONTENT.hiredAgents.panel.collapseTooltip}
          className="size-7 rounded-lg bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 flex items-center justify-center text-theme-text-muted hover:text-theme-text-primary cursor-pointer transition-colors shrink-0"
        >
          <X className="size-3.5" />
        </motion.button>
      </div>

      {/* 2. Scrollable Agents List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
        {totalAgentsCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[300px]">
            <div className="size-12 rounded-2xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center text-theme-text-muted mb-3">
              <Bot className="size-6" />
            </div>
            <h3 className="text-xs font-bold text-theme-text-primary mb-1">
              {APP_CONTENT.hiredAgents.panel.emptyTitle}
            </h3>
            <p className="text-2xs text-theme-text-secondary max-w-xs leading-relaxed mb-4">
              {APP_CONTENT.hiredAgents.panel.emptySubtitle}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {hiredAgents?.map((agent) => {
              const isActive = agent.status === 'active';
              const isCycling = cyclingAgentId === agent.id;

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onClick={() => handleNavigateToAgent(agent.id)}
                  className={`bg-theme-bg-surface hover:bg-theme-bg-elevated/40 border rounded-xl p-3.5 flex flex-col gap-2.5 cursor-pointer transition-all shadow-2xs group relative select-none ${
                    isActive
                      ? 'border-theme-status-success/30 hover:border-theme-brand-binance/50 ring-1 ring-theme-status-success/15'
                      : 'border-theme-border-subtle hover:border-theme-border-subtle/80 opacity-75'
                  }`}
                >
                  {/* Top: Identity & Status Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-9 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center font-extrabold text-xs text-theme-brand-binance shrink-0 overflow-hidden">
                        {agent.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={agent.imageUrl}
                            alt={agent.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span>{agent.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-xs font-bold text-theme-text-primary group-hover:text-theme-brand-binance transition-colors truncate">
                            {agent.name}
                          </h4>
                          <span className="font-mono text-3xs text-theme-brand-binance">
                            #{agent.agentTokenId}
                          </span>
                        </div>
                        <span className="text-3xs text-theme-text-muted truncate">
                          {agent.mission.missionTitle}
                        </span>
                      </div>
                    </div>

                    {/* Status Dot */}
                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      <span
                        className={`size-2 rounded-full ${
                          isActive
                            ? 'bg-theme-status-success animate-pulse'
                            : 'bg-theme-status-warning'
                        }`}
                      />
                      <span
                        className={`text-3xs font-semibold uppercase tracking-wider ${
                          isActive
                            ? 'text-theme-status-success'
                            : 'text-theme-status-warning'
                        }`}
                      >
                        {isActive
                          ? APP_CONTENT.hiredAgents.panel.statusActive
                          : APP_CONTENT.hiredAgents.panel.statusPaused}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Metrics bar */}
                  <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/40 text-3xs">
                    <div className="flex flex-col">
                      <span className="text-theme-text-muted">
                        {APP_CONTENT.hiredAgents.panel.spentLabel}
                      </span>
                      <span className="font-mono font-bold text-theme-text-primary truncate">
                        {agent.spentBudget.toFixed(3)} {agent.budgetAsset}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-theme-text-muted">
                        {APP_CONTENT.hiredAgents.panel.pnlLabel}
                      </span>
                      <span className="font-mono font-bold text-theme-status-success truncate flex items-center gap-0.5">
                        <TrendingUp className="size-2.5" />+${agent.simulatedPnlUsd.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-theme-text-muted">Health</span>
                      <span className="font-mono font-bold text-theme-text-primary truncate flex items-center gap-0.5">
                        <Activity className="size-2.5 text-theme-status-success" />
                        {agent.healthScore}%
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Quick Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-theme-border-subtle/50 text-2xs">
                    <div className="flex items-center gap-1 text-3xs text-theme-text-muted">
                      <Layers className="size-2.5" />
                      <span>{APP_CONTENT.hiredAgents.panel.actionsCount(agent.actionsCount)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Manual Cycle Trigger */}
                      <button
                        type="button"
                        title="Trigger Execution Cycle"
                        disabled={!isActive || isCycling}
                        onClick={(e) => handleTriggerCycle(agent.id, e)}
                        className="size-6 rounded-md bg-theme-bg-elevated hover:bg-theme-brand-binance hover:text-theme-bg-overlay border border-theme-border-subtle text-theme-text-muted flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Zap
                          className={`size-3 ${
                            isCycling ? 'animate-spin text-theme-brand-binance' : ''
                          }`}
                        />
                      </button>

                      {/* Play / Pause Toggle */}
                      <button
                        type="button"
                        title={
                          isActive
                            ? APP_CONTENT.hiredAgents.panel.pauseTooltip
                            : APP_CONTENT.hiredAgents.panel.resumeTooltip
                        }
                        onClick={(e) => handleToggleStatus(agent, e)}
                        className="size-6 rounded-md bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 border border-theme-border-subtle text-theme-text-muted hover:text-theme-text-primary flex items-center justify-center cursor-pointer transition-colors"
                      >
                        {isActive ? (
                          <Pause className="size-3" />
                        ) : (
                          <Play className="size-3 text-theme-status-success" />
                        )}
                      </button>

                      {/* Deep Link to Workspace */}
                      <div className="size-6 rounded-md bg-theme-bg-elevated group-hover:bg-theme-brand-binance group-hover:text-theme-bg-overlay border border-theme-border-subtle flex items-center justify-center text-theme-text-muted transition-colors">
                        <ArrowUpRight className="size-3" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
});
