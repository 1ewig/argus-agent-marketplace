'use client';

import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { AgentLoader } from '@/components/common';
import { APP_CONTENT } from '@/constants/content';
import type { MarketIntelligencePayload } from '@/agent';
import {
  MarketControlCard,
  MarketLevelsCard,
  MarketPositioningCard,
  MarketPlaybookCard,
} from './cards';

// Backwards-compatible re-exports for any callers
export {
  getStoredIntelligence,
  saveStoredIntelligence,
  ONE_HOUR_MS,
} from '@/lib/db';

export interface MarketIntelligenceAgentViewProps {
  data?: MarketIntelligencePayload;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const MarketIntelligenceAgentView = React.memo(function MarketIntelligenceAgentView({
  data,
  isLoading = false,
  isFetching = false,
  isError = false,
  onRetry,
}: MarketIntelligenceAgentViewProps) {
  const content = APP_CONTENT.marketIntelligence;

  // 1. Centered Loader State during initial analysis (only when no cached data exists)
  if ((isLoading || isFetching) && !data) {
    return (
      <div className="flex-1 min-h-[360px] flex flex-col items-center justify-center text-center p-6 my-auto select-none">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute size-14 rounded-full bg-theme-brand-binance/10 animate-ping opacity-75" />
          <div className="size-14 rounded-2xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center shadow-2xs relative z-10">
            <AgentLoader className="size-7 text-theme-brand-binance" />
          </div>
        </div>
        <h4 className="text-sm font-bold text-theme-text-primary mb-1.5">
          {content.scanningTitle}
        </h4>
        <p className="text-xs text-theme-text-secondary leading-relaxed max-w-xs">
          {content.scanningSubtitle}
        </p>
      </div>
    );
  }

  // 2. Error State with Retry
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs gap-3 my-auto select-none">
        <div className="size-10 rounded-xl bg-theme-status-danger/10 text-theme-status-danger flex items-center justify-center">
          <AlertCircle className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold text-theme-text-primary">
            {content.errorTitle}
          </h4>
          <p className="text-xs text-theme-text-secondary max-w-xs leading-relaxed">
            {content.errorSubtitle}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-theme-brand-binance text-theme-bg-overlay hover:brightness-105 active:brightness-95 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className="size-3" />
            <span>{content.retryButton}</span>
          </button>
        )}
      </div>
    );
  }

  // 3. Render Grounded 4-Card Executive Market Intelligence
  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 select-none">
      <MarketControlCard control={data.control} />
      <MarketLevelsCard levels={data.levels} />
      <MarketPositioningCard positioning={data.positioning} />
      <MarketPlaybookCard playbook={data.playbook} />
    </div>
  );
});

MarketIntelligenceAgentView.displayName = 'MarketIntelligenceAgentView';
