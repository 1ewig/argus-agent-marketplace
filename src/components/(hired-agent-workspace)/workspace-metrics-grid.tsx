'use client';

import React, { memo } from 'react';
import {
  Coins,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  Clock,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export interface WorkspaceMetricsGridProps {
  allocatedBudget: number;
  spentBudget: number;
  budgetAsset: string;
  simulatedPnlUsd: number;
  healthScore: number;
  actionsCount: number;
  hiredAt: number;
}

export const WorkspaceMetricsGrid = memo(function WorkspaceMetricsGrid({
  allocatedBudget,
  spentBudget,
  budgetAsset,
  simulatedPnlUsd,
  healthScore,
  actionsCount,
  hiredAt,
}: WorkspaceMetricsGridProps) {
  const budgetPct = Math.min(
    100,
    Math.max(0, (spentBudget / allocatedBudget) * 100),
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Allocated Budget */}
      <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-2xs font-medium text-theme-text-muted">
          <Coins className="size-3.5 text-theme-brand-binance" />
          <span>{APP_CONTENT.hiredAgents.workspace.metrics.allocated}</span>
        </div>
        <span className="text-sm font-mono font-semibold text-theme-text-primary truncate">
          {allocatedBudget.toFixed(2)} {budgetAsset}
        </span>
      </div>

      {/* Spent Budget with Mini Progress Bar */}
      <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-2xs font-medium text-theme-text-muted">
          <Zap className="size-3.5 text-theme-status-warning" />
          <span>{APP_CONTENT.hiredAgents.workspace.metrics.spent}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono font-semibold text-theme-text-primary truncate">
            {spentBudget.toFixed(4)}
          </span>
          <span className="text-2xs text-theme-text-muted font-mono">{budgetPct.toFixed(0)}%</span>
        </div>
        <div className="w-full h-1 bg-theme-bg-elevated rounded-full overflow-hidden mt-0.5">
          <div
            className="h-full bg-theme-brand-binance rounded-full transition-all"
            style={{ width: `${budgetPct}%` }}
          />
        </div>
      </div>

      {/* Simulated PnL / Yield */}
      <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-2xs font-medium text-theme-text-muted">
          <TrendingUp className="size-3.5 text-theme-status-success" />
          <span>{APP_CONTENT.hiredAgents.workspace.metrics.pnl}</span>
        </div>
        <span className="text-sm font-mono font-semibold text-theme-status-success truncate">
          +${simulatedPnlUsd.toFixed(2)}
        </span>
      </div>

      {/* Health Score */}
      <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-2xs font-medium text-theme-text-muted">
          <Activity className="size-3.5 text-theme-status-success" />
          <span>{APP_CONTENT.hiredAgents.workspace.metrics.health}</span>
        </div>
        <span className="text-sm font-mono font-semibold text-theme-text-primary truncate">
          {healthScore}%
        </span>
      </div>

      {/* Actions Count */}
      <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-2xs font-medium text-theme-text-muted">
          <Layers className="size-3.5 text-theme-status-info" />
          <span>{APP_CONTENT.hiredAgents.workspace.metrics.actions}</span>
        </div>
        <span className="text-sm font-mono font-semibold text-theme-text-primary truncate">
          {actionsCount}
        </span>
      </div>

      {/* Deployed Timestamp */}
      <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-2xs font-medium text-theme-text-muted">
          <Clock className="size-3.5 text-theme-text-muted" />
          <span>{APP_CONTENT.hiredAgents.workspace.metrics.hiredDate}</span>
        </div>
        <span className="text-sm font-semibold text-theme-text-primary truncate">
          {new Date(hiredAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
});
