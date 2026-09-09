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
  Sparkles,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import { useAutoExecutionTicker } from '@/hooks/agents';
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

  // Auto-execution heartbeat hook (periodically cycles active agents)
  const { isEnabled: isAutoTickerActive, toggleTicker: toggleAutoTicker } =
    useAutoExecutionTicker({
      intervalMs: 15000,
      initialEnabled: true,
    });

  // Auto-seed demo agents on first launch
  useEffect(() => {
    seedInitialHiredAgents();
  }, []);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* 1. Backdrop Overlay */}
          <motion.div
            key="hired-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-theme-bg-overlay/60 backdrop-blur-xs cursor-pointer"
          />

          {/* 2. Slide-Over Panel Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
            <motion.aside
              key="hired-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="pointer-events-auto w-screen max-w-md sm:max-w-lg bg-theme-bg-surface border-l border-theme-border-subtle shadow-2xl flex flex-col h-full overflow-hidden"
            >
              {/* Panel Header */}
              <div className="h-16 px-4 sm:px-5 border-b border-theme-border-subtle flex items-center justify-between gap-3 bg-theme-bg-surface shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-lg bg-theme-brand-binance/10 border border-theme-brand-binance/25 flex items-center justify-center text-theme-brand-binance shrink-0">
                    <Bot className="size-4.5" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-theme-text-primary tracking-tight truncate">
                        {APP_CONTENT.hiredAgents.panel.title}
                      </h2>
                      <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-theme-status-success/15 text-theme-status-success border border-theme-status-success/30 font-mono shrink-0">
                        {activeAgents.length} Active
                      </span>
                    </div>
                    <p className="text-xs text-theme-text-muted truncate mt-0.5">
                      {APP_CONTENT.hiredAgents.panel.subtitle(
                        activeAgents.length,
                        totalAgentsCount,
                      )}
                    </p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileTap={tapScalePill}
                  onClick={onClose}
                  title={APP_CONTENT.hiredAgents.panel.collapseTooltip}
                  className="size-8 rounded-lg bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 flex items-center justify-center text-theme-text-muted hover:text-theme-text-primary cursor-pointer transition-colors shrink-0"
                >
                  <X className="size-4" />
                </motion.button>
              </div>

              {/* Auto-Execution Heartbeat Ribbon */}
              {totalAgentsCount > 0 && (
                <div className="px-4 py-2 bg-theme-bg-elevated/50 border-b border-theme-border-subtle/70 flex items-center justify-between gap-2 shrink-0 select-none">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`size-2 rounded-full shrink-0 ${
                        isAutoTickerActive
                          ? 'bg-theme-status-success animate-pulse'
                          : 'bg-theme-text-muted/40'
                      }`}
                    />
                    <div className="flex items-center gap-1.5 truncate">
                      <Sparkles className="size-3 text-theme-brand-binance shrink-0" />
                      <span className="text-2xs font-semibold text-theme-text-primary truncate">
                        {isAutoTickerActive
                          ? APP_CONTENT.hiredAgents.panel.autoCycleActive
                          : APP_CONTENT.hiredAgents.panel.autoCycleInactive}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleAutoTicker}
                    title={APP_CONTENT.hiredAgents.panel.autoCycleTooltip}
                    className={`h-6.5 px-2.5 rounded-full text-2xs font-bold tracking-wide uppercase transition-all cursor-pointer border flex items-center gap-1 ${
                      isAutoTickerActive
                        ? 'bg-theme-brand-binance text-theme-bg-overlay border-theme-brand-binance shadow-2xs'
                        : 'bg-theme-bg-elevated border-theme-border-subtle text-theme-text-muted hover:text-theme-text-primary'
                    }`}
                  >
                    <span>{isAutoTickerActive ? 'Auto ON' : 'Auto OFF'}</span>
                  </button>
                </div>
              )}

              {/* Scrollable Agents List */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
                {totalAgentsCount === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[300px]">
                    <div className="size-12 rounded-2xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center text-theme-text-muted mb-3">
                      <Bot className="size-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-theme-text-primary mb-1">
                      {APP_CONTENT.hiredAgents.panel.emptyTitle}
                    </h3>
                    <p className="text-xs text-theme-text-secondary max-w-xs leading-relaxed mb-4">
                      {APP_CONTENT.hiredAgents.panel.emptySubtitle}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {hiredAgents?.map((agent) => {
                      const isActive = agent.status === 'active';
                      const isCycling = cyclingAgentId === agent.id;

                      return (
                        <div
                          key={agent.id}
                          onClick={() => handleNavigateToAgent(agent.id)}
                          className={`bg-theme-bg-surface hover:bg-theme-bg-elevated/40 border rounded-xl p-3.5 flex flex-col gap-2.5 cursor-pointer transition-all shadow-2xs group relative select-none ${isActive
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
                                  <h4 className="text-sm font-semibold text-theme-text-primary group-hover:text-theme-brand-binance transition-colors truncate">
                                    {agent.name}
                                  </h4>
                                  <span className="font-mono text-2xs font-medium text-theme-brand-binance shrink-0">
                                    #{agent.agentTokenId}
                                  </span>
                                </div>
                                <p className="text-xs text-theme-text-muted truncate mt-0.5">
                                  {agent.mission.missionTitle}
                                </p>
                              </div>
                            </div>

                            {/* Status Indicator */}
                            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                              <span
                                className={`size-1.5 rounded-full ${isActive
                                    ? 'bg-theme-status-success animate-pulse'
                                    : 'bg-theme-status-warning'
                                  }`}
                              />
                              <span
                                className={`text-2xs font-medium uppercase tracking-wider ${isActive
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
                          <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/40">
                            <div className="flex flex-col">
                              <span className="text-2xs text-theme-text-muted font-medium">
                                {APP_CONTENT.hiredAgents.panel.spentLabel}
                              </span>
                              <span className="font-mono text-xs font-semibold text-theme-text-primary truncate mt-0.5">
                                {agent.spentBudget.toFixed(3)} {agent.budgetAsset}
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-2xs text-theme-text-muted font-medium">
                                {APP_CONTENT.hiredAgents.panel.pnlLabel}
                              </span>
                              <span className="font-mono text-xs font-semibold text-theme-status-success truncate flex items-center gap-0.5 mt-0.5">
                                <TrendingUp className="size-3" />+${agent.simulatedPnlUsd.toFixed(1)}
                              </span>
                            </div>

                            <div className="flex flex-col">
                              <span className="text-2xs text-theme-text-muted font-medium">Health</span>
                              <span className="font-mono text-xs font-semibold text-theme-text-primary truncate flex items-center gap-0.5 mt-0.5">
                                <Activity className="size-3 text-theme-status-success" />
                                {agent.healthScore}%
                              </span>
                            </div>
                          </div>

                          {/* Bottom: Quick Actions */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-theme-border-subtle/50">
                            <div className="flex items-center gap-1.5 text-2xs text-theme-text-muted">
                              <Layers className="size-3" />
                              <span>
                                {APP_CONTENT.hiredAgents.panel.actionsCount(agent.actionsCount)}
                              </span>
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
                                  className={`size-3 ${isCycling ? 'animate-spin text-theme-brand-binance' : ''
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
});