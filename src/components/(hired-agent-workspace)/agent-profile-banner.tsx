'use client';

import React, { memo } from 'react';
import { APP_CONTENT } from '@/constants/content';
import { resolveAgentImageUrl } from '@/lib/utils';
import type { HiringStatus } from '@/lib/types';

export interface AgentProfileBannerProps {
  name: string;
  agentTokenId: string;
  chainId?: number;
  imageUrl?: string | null;
  missionTitle: string;
  targetProtocol: string;
  status: HiringStatus;
}

export const AgentProfileBanner = memo(function AgentProfileBanner({
  name,
  agentTokenId,
  chainId = 56,
  imageUrl,
  missionTitle,
  targetProtocol,
  status,
}: AgentProfileBannerProps) {
  const isActive = status === 'active';
  const isPaused = status === 'paused';
  const resolvedImageUrl = resolveAgentImageUrl(imageUrl, chainId, agentTokenId);

  return (
    <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="size-14 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center font-bold text-sm text-theme-brand-binance shrink-0 overflow-hidden relative">
          {resolvedImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedImageUrl}
              alt={name}
              className="size-full object-cover absolute inset-0 z-1"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : null}
          <span>{name.slice(0, 2).toUpperCase()}</span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-theme-text-primary truncate">
              {name}
            </h1>
            <span className="font-mono text-xs sm:text-sm font-semibold text-theme-brand-binance">
              #{agentTokenId}
            </span>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-theme-brand-binance/15 text-theme-brand-binance border border-theme-brand-binance/30 uppercase tracking-wider">
              Simulation Sandbox
            </span>
          </div>
          <p className="text-xs sm:text-sm text-theme-text-secondary mt-1 truncate">
            {missionTitle} • {targetProtocol}
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
          className={`text-2xs font-semibold uppercase tracking-wider ${
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
  );
});
