'use client';

import React, { memo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Bot,
  Play,
  Pause,
  Zap,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  Layers,
  Coins,
  AlertTriangle,
  FileText,
  Terminal,
  ArrowUpRight,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import { truncateAddress } from '@/lib/utils';
import {
  db,
  updateHiredAgentStatus,
  terminateHiredAgent,
  triggerAgentExecutionCycle,
} from '@/lib/db';
import type { HiredAgentRecord } from '@/lib/types';

export interface HiredAgentDetailClientProps {
  id: string;
}

export const HiredAgentDetailClient = memo(function HiredAgentDetailClient({
  id,
}: HiredAgentDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'mandate' | 'timeline' | 'telemetry'>('timeline');
  const [isCycling, setIsCycling] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live reactive query for this specific agent
  const agent = useLiveQuery(async () => {
    return await db.hiredAgents.get(id);
  }, [id]) as HiredAgentRecord | undefined;

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const handleToggleStatus = useCallback(async () => {
    if (!agent) return;
    const nextStatus = agent.status === 'active' ? 'paused' : 'active';
    await updateHiredAgentStatus(agent.id, nextStatus);
  }, [agent]);

  const handleTriggerCycle = useCallback(async () => {
    if (!agent || agent.status !== 'active' || isCycling) return;
    setIsCycling(true);
    try {
      await triggerAgentExecutionCycle(agent.id);
    } finally {
      setTimeout(() => setIsCycling(false), 500);
    }
  }, [agent, isCycling]);

  const handleTerminate = useCallback(async () => {
    if (!agent) return;
    const confirmed = window.confirm(
      'Are you sure you want to terminate this autonomous contract? Unspent simulation escrow will be released.',
    );
    if (confirmed) {
      await terminateHiredAgent(agent.id);
      router.push('/marketplace');
    }
  }, [agent, router]);

  // Loading or not found state
  if (agent === undefined) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <Bot className="size-8 animate-pulse text-theme-brand-binance mb-3" />
        <span className="text-xs text-theme-text-muted">Loading Agent Workspace...</span>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <div className="size-12 rounded-2xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center text-theme-text-muted mb-3">
          <AlertTriangle className="size-6 text-theme-status-warning" />
        </div>
        <h2 className="text-sm font-bold text-theme-text-primary mb-1">Hired Agent Not Found</h2>
        <p className="text-xs text-theme-text-secondary max-w-sm mb-4">
          This hired agent may have been terminated or removed from your local database.
        </p>
        <Link
          href="/marketplace"
          className="h-9 px-4 rounded-xl bg-theme-brand-binance text-theme-bg-overlay text-xs font-bold flex items-center gap-1.5 shadow-2xs"
        >
          <ChevronLeft className="size-3.5" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const isActive = agent.status === 'active';
  const isPaused = agent.status === 'paused';
  const budgetPct = Math.min(100, Math.max(0, (agent.spentBudget / agent.allocatedBudget) * 100));

  const bscScanContractUrl = `https://bscscan.com/token/${agent.contractAddress}?a=${agent.agentTokenId}`;
  const scan8004Url = `https://8004scan.io/agents/bsc/${agent.agentTokenId}`;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-theme-bg-base select-none">
      {/* 1. Header Toolbar & Breadcrumb */}
      <header className="w-full bg-theme-bg-surface/90 backdrop-blur-md border-b border-theme-border-subtle shrink-0 z-20 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/marketplace"
            className="h-8 px-2.5 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle hover:border-theme-brand-binance/50 text-theme-text-secondary hover:text-theme-text-primary text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ChevronLeft className="size-3.5" />
            <span className="hidden sm:inline">Marketplace</span>
          </Link>

          <span className="text-theme-border-subtle">/</span>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-theme-text-primary truncate">
              {agent.name}
            </span>
            <span className="font-mono text-3xs font-semibold text-theme-brand-binance">
              #{agent.agentTokenId}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Manual Run Cycle */}
          <motion.button
            type="button"
            whileTap={isActive ? tapScalePill : undefined}
            disabled={!isActive || isCycling}
            onClick={handleTriggerCycle}
            className="h-8 px-3 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle hover:border-theme-brand-binance text-xs font-semibold text-theme-text-primary flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Zap className={`size-3.5 ${isCycling ? 'animate-spin text-theme-brand-binance' : ''}`} />
            <span className="hidden sm:inline">
              {isCycling
                ? APP_CONTENT.hiredAgents.workspace.actions.runningCycle
                : APP_CONTENT.hiredAgents.workspace.actions.runCycleNow}
            </span>
          </motion.button>

          {/* Pause / Resume */}
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={handleToggleStatus}
            className={`h-8 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isActive
                ? 'bg-theme-bg-elevated border-theme-border-subtle hover:border-theme-status-warning text-theme-text-secondary hover:text-theme-status-warning'
                : 'bg-theme-status-success/15 border-theme-status-success/30 text-theme-status-success hover:bg-theme-status-success/25'
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

          {/* Terminate */}
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={handleTerminate}
            title={APP_CONTENT.hiredAgents.workspace.actions.terminateAgent}
            className="size-8 rounded-lg bg-theme-bg-elevated hover:bg-theme-status-danger/15 border border-theme-border-subtle hover:border-theme-status-danger/40 text-theme-text-muted hover:text-theme-status-danger flex items-center justify-center cursor-pointer transition-colors"
          >
            <Trash2 className="size-3.5" />
          </motion.button>
        </div>
      </header>

      {/* 2. Main Workspace Body */}
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Agent Profile & Live Status Ribbon */}
        <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-14 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center font-bold text-sm text-theme-brand-binance shrink-0 overflow-hidden">
              {agent.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={agent.imageUrl} alt={agent.name} className="size-full object-cover" />
              ) : (
                <span>{agent.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-theme-text-primary truncate">
                  {agent.name}
                </h1>
                <span className="font-mono text-xs font-semibold text-theme-brand-binance">
                  #{agent.agentTokenId}
                </span>
                <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-theme-brand-binance/15 text-theme-brand-binance border border-theme-brand-binance/30 uppercase tracking-wider">
                  Simulation Sandbox
                </span>
              </div>
              <p className="text-2xs text-theme-text-secondary mt-0.5 truncate">
                {agent.mission.missionTitle} • {agent.mission.targetPairOrProtocol}
              </p>
            </div>
          </div>

          {/* Status Heartbeat Banner */}
          <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle">
            <span
              className={`size-2 rounded-full ${
                isActive
                  ? 'bg-theme-status-success animate-pulse'
                  : isPaused
                    ? 'bg-theme-status-warning'
                    : 'bg-theme-status-danger'
              }`}
            />
            <span
              className={`text-2xs font-bold uppercase tracking-wider ${
                isActive
                  ? 'text-theme-status-success'
                  : isPaused
                    ? 'text-theme-status-warning'
                    : 'text-theme-status-danger'
              }`}
            >
              {isActive
                ? APP_CONTENT.hiredAgents.workspace.statusActive
                : isPaused
                  ? APP_CONTENT.hiredAgents.workspace.statusPaused
                  : APP_CONTENT.hiredAgents.workspace.statusTerminated}
            </span>
          </div>
        </div>

        {/* 6 Key Operational Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Allocated Budget */}
          <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-3xs text-theme-text-muted">
              <Coins className="size-3 text-theme-brand-binance" />
              <span>{APP_CONTENT.hiredAgents.workspace.metrics.allocated}</span>
            </div>
            <span className="text-sm font-mono font-bold text-theme-text-primary truncate">
              {agent.allocatedBudget.toFixed(2)} {agent.budgetAsset}
            </span>
          </div>

          {/* Spent Budget with Mini Progress Bar */}
          <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-3xs text-theme-text-muted">
              <Zap className="size-3 text-theme-status-warning" />
              <span>{APP_CONTENT.hiredAgents.workspace.metrics.spent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-bold text-theme-text-primary truncate">
                {agent.spentBudget.toFixed(4)}
              </span>
              <span className="text-3xs text-theme-text-muted font-mono">{budgetPct.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1 bg-theme-bg-elevated rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-theme-brand-binance rounded-full transition-all"
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>

          {/* Simulated PnL / Yield */}
          <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-3xs text-theme-text-muted">
              <TrendingUp className="size-3 text-theme-status-success" />
              <span>{APP_CONTENT.hiredAgents.workspace.metrics.pnl}</span>
            </div>
            <span className="text-sm font-mono font-bold text-theme-status-success truncate">
              +${agent.simulatedPnlUsd.toFixed(2)}
            </span>
          </div>

          {/* Health Score */}
          <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-3xs text-theme-text-muted">
              <Activity className="size-3 text-theme-status-success" />
              <span>{APP_CONTENT.hiredAgents.workspace.metrics.health}</span>
            </div>
            <span className="text-sm font-mono font-bold text-theme-text-primary truncate">
              {agent.healthScore}%
            </span>
          </div>

          {/* Actions Count */}
          <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-3xs text-theme-text-muted">
              <Layers className="size-3 text-theme-status-info" />
              <span>{APP_CONTENT.hiredAgents.workspace.metrics.actions}</span>
            </div>
            <span className="text-sm font-mono font-bold text-theme-text-primary truncate">
              {agent.actionsCount}
            </span>
          </div>

          {/* Deployed Timestamp */}
          <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-3xs text-theme-text-muted">
              <Clock className="size-3 text-theme-text-muted" />
              <span>{APP_CONTENT.hiredAgents.workspace.metrics.hiredDate}</span>
            </div>
            <span className="text-sm font-bold text-theme-text-secondary truncate">
              {new Date(agent.hiredAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 border-b border-theme-border-subtle pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`h-8 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'timeline'
                ? 'bg-theme-brand-binance text-theme-bg-overlay font-bold shadow-2xs'
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated'
            }`}
          >
            <Activity className="size-3.5" />
            <span>{APP_CONTENT.hiredAgents.workspace.tabs.timeline}</span>
            <span className="text-3xs font-mono ml-1 px-1 rounded bg-black/15">
              {agent.executionLogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mandate')}
            className={`h-8 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'mandate'
                ? 'bg-theme-brand-binance text-theme-bg-overlay font-bold shadow-2xs'
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated'
            }`}
          >
            <FileText className="size-3.5" />
            <span>{APP_CONTENT.hiredAgents.workspace.tabs.overview}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`h-8 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'telemetry'
                ? 'bg-theme-brand-binance text-theme-bg-overlay font-bold shadow-2xs'
                : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated'
            }`}
          >
            <Terminal className="size-3.5" />
            <span>{APP_CONTENT.hiredAgents.workspace.tabs.terminal}</span>
          </button>
        </div>

        {/* TAB 1: Execution Activity Stream (Step Trace) */}
        {activeTab === 'timeline' && (
          <div className="flex flex-col gap-2.5">
            {agent.executionLogs.length === 0 ? (
              <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-8 text-center">
                <span className="text-xs text-theme-text-muted">
                  {APP_CONTENT.hiredAgents.workspace.logs.emptyDesc}
                </span>
              </div>
            ) : (
              agent.executionLogs.map((log) => {
                const isAlert = log.type === 'alert';
                const isAction = log.type === 'action';

                return (
                  <div
                    key={log.id}
                    className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3.5 flex items-start gap-3 transition-colors hover:border-theme-border-subtle/80"
                  >
                    <div
                      className={`size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isAlert
                          ? 'bg-theme-status-warning/15 text-theme-status-warning border border-theme-status-warning/30'
                          : isAction
                            ? 'bg-theme-brand-binance/15 text-theme-brand-binance border border-theme-brand-binance/30'
                            : 'bg-theme-bg-elevated text-theme-text-muted border border-theme-border-subtle'
                      }`}
                    >
                      {isAlert ? (
                        <Shield className="size-3.5" />
                      ) : isAction ? (
                        <Zap className="size-3.5" />
                      ) : (
                        <Bot className="size-3.5" />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-theme-text-primary truncate">
                          {log.title}
                        </span>
                        <span className="text-3xs text-theme-text-muted font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-2xs text-theme-text-secondary leading-relaxed">
                        {log.detail}
                      </p>

                      {/* Transaction Hash and Gas Info */}
                      {(log.txHash || log.gasUsedEth) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 mt-1 border-t border-theme-border-subtle/40 text-3xs">
                          {log.txHash && (
                            <div className="flex items-center gap-1.5 font-mono text-theme-text-muted">
                              <span>Tx:</span>
                              <span className="text-theme-brand-binance truncate max-w-[120px] sm:max-w-[200px]">
                                {log.txHash}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(log.txHash!, log.id)}
                                className="text-theme-text-muted hover:text-theme-text-primary cursor-pointer"
                              >
                                {copiedKey === log.id ? (
                                  <Check className="size-2.5 text-theme-status-success" />
                                ) : (
                                  <Copy className="size-2.5" />
                                )}
                              </button>
                            </div>
                          )}

                          {log.gasUsedEth && (
                            <span className="text-theme-text-muted font-mono">
                              Gas: {log.gasUsedEth}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: Mission Mandate & Architecture */}
        {activeTab === 'mandate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Strategy & Risk Parameters */}
            <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-4 flex flex-col gap-3">
              <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                {APP_CONTENT.hiredAgents.workspace.mandate.title}
              </span>

              <div className="flex items-center justify-between text-2xs py-1.5 border-b border-theme-border-subtle/50">
                <span className="text-theme-text-muted">
                  {APP_CONTENT.hiredAgents.workspace.mandate.strategyType}
                </span>
                <span className="font-bold text-theme-text-primary capitalize">
                  {agent.mission.strategyType.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-2xs py-1.5 border-b border-theme-border-subtle/50">
                <span className="text-theme-text-muted">
                  {APP_CONTENT.hiredAgents.workspace.mandate.targetProtocol}
                </span>
                <span className="font-semibold text-theme-brand-binance">
                  {agent.mission.targetPairOrProtocol}
                </span>
              </div>

              <div className="flex items-center justify-between text-2xs py-1.5 border-b border-theme-border-subtle/50">
                <span className="text-theme-text-muted">
                  {APP_CONTENT.hiredAgents.workspace.mandate.interval}
                </span>
                <span className="font-mono text-theme-text-secondary">
                  Every {agent.mission.executionIntervalMinutes} minutes
                </span>
              </div>

              {agent.mission.healthFactorThreshold && (
                <div className="flex items-center justify-between text-2xs py-1.5 border-b border-theme-border-subtle/50">
                  <span className="text-theme-text-muted">Health Factor Alert Threshold</span>
                  <span className="font-mono font-bold text-theme-status-warning">
                    {agent.mission.healthFactorThreshold}%
                  </span>
                </div>
              )}

              {agent.mission.gridUpperPrice && (
                <div className="flex items-center justify-between text-2xs py-1.5 border-b border-theme-border-subtle/50">
                  <span className="text-theme-text-muted">Grid Range Bounds</span>
                  <span className="font-mono font-bold text-theme-text-primary">
                    ${agent.mission.gridLowerPrice} - ${agent.mission.gridUpperPrice}
                  </span>
                </div>
              )}

              {agent.mission.customPrompt && (
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-3xs text-theme-text-muted uppercase">Custom Directives</span>
                  <p className="text-2xs text-theme-text-secondary bg-theme-bg-elevated p-2.5 rounded-lg border border-theme-border-subtle/60 leading-relaxed">
                    {agent.mission.customPrompt}
                  </p>
                </div>
              )}
            </div>

            {/* On-Chain Identity & Registry Links */}
            <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-4 flex flex-col gap-3">
              <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                On-Chain Architecture (BNB Smart Chain)
              </span>

              <div className="flex items-center justify-between text-2xs py-1.5 border-b border-theme-border-subtle/50">
                <span className="text-theme-text-muted">
                  {APP_CONTENT.hiredAgents.workspace.mandate.contractAddress}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-theme-text-primary font-medium">
                    {truncateAddress(agent.contractAddress)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(agent.contractAddress, 'contract')}
                    className="text-theme-text-muted hover:text-theme-text-primary cursor-pointer"
                  >
                    {copiedKey === 'contract' ? (
                      <Check className="size-3 text-theme-status-success" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-2xs py-1.5 border-b border-theme-border-subtle/50">
                <span className="text-theme-text-muted">
                  {APP_CONTENT.hiredAgents.workspace.mandate.ownerAddress}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-theme-text-primary font-medium">
                    {truncateAddress(agent.ownerAddress)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(agent.ownerAddress, 'owner')}
                    className="text-theme-text-muted hover:text-theme-text-primary cursor-pointer"
                  >
                    {copiedKey === 'owner' ? (
                      <Check className="size-3 text-theme-status-success" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-2xs py-1.5 border-b border-theme-border-subtle/50">
                <span className="text-theme-text-muted">Execution Standard</span>
                <span className="font-mono text-theme-brand-binance font-semibold">
                  ERC-8004 / ERC-8183 / x402
                </span>
              </div>

              {/* External Explorer Links */}
              <div className="flex items-center gap-4 pt-2">
                <a
                  href={bscScanContractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xs font-semibold text-theme-text-secondary hover:text-theme-text-primary flex items-center gap-1 transition-colors"
                >
                  <span>Verify on BscScan</span>
                  <ExternalLink className="size-3 text-theme-text-muted" />
                </a>

                <a
                  href={scan8004Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xs font-semibold text-theme-text-secondary hover:text-theme-brand-binance flex items-center gap-1 transition-colors"
                >
                  <span>View 8004scan Profile</span>
                  <ArrowUpRight className="size-3 text-theme-brand-binance" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Raw Telemetry & Terminal View */}
        {activeTab === 'telemetry' && (
          <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-2xs pb-2 border-b border-theme-border-subtle/50">
              <span className="font-mono text-theme-text-muted">Local IndexedDB Node Snapshot</span>
              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(agent, null, 2), 'json')}
                className="text-2xs text-theme-brand-binance hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'json' ? <span>Copied JSON!</span> : <span>Copy JSON</span>}
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-theme-bg-elevated/70 border border-theme-border-subtle/50 font-mono text-3xs text-theme-text-secondary overflow-x-auto leading-relaxed">
              {JSON.stringify(agent, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
});
