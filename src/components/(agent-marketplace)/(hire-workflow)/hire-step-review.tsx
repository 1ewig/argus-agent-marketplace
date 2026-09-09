'use client';

import React, { memo } from 'react';
import { APP_CONTENT } from '@/constants/content';

export interface HireStepReviewProps {
  displayName: string;
  tokenId: string;
  missionTitle: string;
  targetProtocol: string;
  intervalMinutes: number;
  budgetBnb: number;
}

export const HireStepReview = memo(function HireStepReview({
  displayName,
  tokenId,
  missionTitle,
  targetProtocol,
  intervalMinutes,
  budgetBnb,
}: HireStepReviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-theme-bg-elevated/40 border border-theme-border-subtle rounded-xl p-4 flex flex-col gap-3">
        <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
          {APP_CONTENT.hiredAgents.modal.review.summaryTitle}
        </span>

        <div className="flex items-center justify-between text-2xs py-1 border-b border-theme-border-subtle/50">
          <span className="text-theme-text-muted">
            {APP_CONTENT.hiredAgents.modal.review.agentLabel}
          </span>
          <span className="font-bold text-theme-text-primary">
            {displayName} (#{tokenId})
          </span>
        </div>

        <div className="flex items-center justify-between text-2xs py-1 border-b border-theme-border-subtle/50">
          <span className="text-theme-text-muted">
            {APP_CONTENT.hiredAgents.modal.review.strategyLabel}
          </span>
          <span className="font-semibold text-theme-brand-binance">
            {missionTitle} ({targetProtocol})
          </span>
        </div>

        <div className="flex items-center justify-between text-2xs py-1 border-b border-theme-border-subtle/50">
          <span className="text-theme-text-muted">
            {APP_CONTENT.hiredAgents.modal.review.intervalLabel}
          </span>
          <span className="text-theme-text-secondary font-mono">
            Every {intervalMinutes} minutes
          </span>
        </div>

        <div className="flex items-center justify-between text-2xs py-1 border-b border-theme-border-subtle/50">
          <span className="text-theme-text-muted">
            {APP_CONTENT.hiredAgents.modal.review.escrowLabel}
          </span>
          <span className="font-mono font-bold text-theme-text-primary">
            {budgetBnb} simBNB (Simulation Escrow)
          </span>
        </div>

        <div className="flex items-center justify-between text-2xs py-1">
          <span className="text-theme-text-muted">
            {APP_CONTENT.hiredAgents.modal.review.networkLabel}
          </span>
          <span className="text-theme-text-secondary font-mono">
            {APP_CONTENT.hiredAgents.modal.review.networkValue}
          </span>
        </div>
      </div>

      <div className="text-3xs text-theme-text-muted bg-theme-bg-elevated/20 p-3 rounded-lg border border-theme-border-subtle/40 flex items-center justify-between">
        <span>Protocol Standard</span>
        <span className="font-mono text-theme-text-secondary">
          {APP_CONTENT.hiredAgents.modal.review.protocolStandard}
        </span>
      </div>
    </div>
  );
});
