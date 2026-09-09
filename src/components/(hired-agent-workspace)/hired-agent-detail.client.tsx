'use client';

import React, { memo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, Bot, AlertTriangle } from 'lucide-react';
import {
  db,
  updateHiredAgentStatus,
  terminateHiredAgent,
  triggerAgentExecutionCycle,
} from '@/lib/db';
import {
  WorkspaceHeader,
  AgentProfileBanner,
  WorkspaceMetricsGrid,
  WorkspaceTabsNav,
  ExecutionTimeline,
  MissionMandateCard,
  RawTelemetryView,
  type WorkspaceTabKey,
} from './';
import type { HiredAgentRecord } from '@/lib/types';

export interface HiredAgentDetailClientProps {
  id: string;
}

export const HiredAgentDetailClient = memo(function HiredAgentDetailClient({
  id,
}: HiredAgentDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>('timeline');
  const [isCycling, setIsCycling] = useState(false);

  // Live reactive query for this specific agent
  const agent = useLiveQuery(async () => {
    return await db.hiredAgents.get(id);
  }, [id]) as HiredAgentRecord | undefined;

  const agentId = agent?.id;
  const agentStatus = agent?.status;

  // Background auto-execution ticker when viewing an active agent
  React.useEffect(() => {
    if (!agentId || agentStatus !== 'active') return;
    const interval = setInterval(() => {
      triggerAgentExecutionCycle(agentId).catch((e) =>
        console.error('[Workspace] Background cycle failed:', e),
      );
    }, 20000); // Cycle every 20 seconds while in workspace

    return () => clearInterval(interval);
  }, [agentId, agentStatus]);

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

  // Loading state
  if (agent === undefined) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <Bot className="size-8 animate-pulse text-theme-brand-binance mb-3" />
        <span className="text-sm font-medium text-theme-text-muted">Loading Agent Workspace...</span>
      </div>
    );
  }

  // Not found state
  if (!agent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <div className="size-12 rounded-2xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center text-theme-text-muted mb-3">
          <AlertTriangle className="size-6 text-theme-status-warning" />
        </div>
        <h2 className="text-base font-bold text-theme-text-primary mb-1.5">Hired Agent Not Found</h2>
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

  return (
    <div className="flex-1 flex flex-col h-full w-full min-h-0 bg-theme-bg-base overflow-hidden select-none">
      {/* 1. Fixed Header Toolbar */}
      <WorkspaceHeader
        name={agent.name}
        agentTokenId={agent.agentTokenId}
        isActive={isActive}
        isCycling={isCycling}
        onTriggerCycle={handleTriggerCycle}
        onToggleStatus={handleToggleStatus}
        onTerminate={handleTerminate}
      />

      {/* 2. Scrollable Workspace Body */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Agent Profile & Live Status Ribbon */}
        <AgentProfileBanner
          name={agent.name}
          agentTokenId={agent.agentTokenId}
          imageUrl={agent.imageUrl}
          missionTitle={agent.mission.missionTitle}
          targetProtocol={agent.mission.targetPairOrProtocol}
          status={agent.status}
        />

        {/* 6 Key Operational Telemetry Metric Cards */}
        <WorkspaceMetricsGrid
          allocatedBudget={agent.allocatedBudget}
          spentBudget={agent.spentBudget}
          budgetAsset={agent.budgetAsset}
          simulatedPnlUsd={agent.simulatedPnlUsd}
          healthScore={agent.healthScore}
          actionsCount={agent.actionsCount}
          hiredAt={agent.hiredAt}
        />

        {/* Tab Navigation */}
        <WorkspaceTabsNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          logsCount={agent.executionLogs.length}
        />

        {/* Tab 1: Execution Timeline */}
        {activeTab === 'timeline' && (
          <ExecutionTimeline logs={agent.executionLogs} />
        )}

        {/* Tab 2: Mission Mandate & Architecture */}
        {activeTab === 'mandate' && (
          <MissionMandateCard
            mission={agent.mission}
            contractAddress={agent.contractAddress}
            ownerAddress={agent.ownerAddress}
            agentTokenId={agent.agentTokenId}
          />
        )}

        {/* Tab 3: Raw Telemetry / JSON Snapshot */}
        {activeTab === 'telemetry' && (
          <RawTelemetryView data={agent} />
        )}
        </div>
      </div>
    </div>
  );
});