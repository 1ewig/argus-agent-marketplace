'use client';

import React, { memo } from 'react';
import {
  AlertTriangle,
  RotateCw,
  SearchX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AgentCard } from './agent-card';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import type { ScanAgentItem } from '@/lib/8004scan/types';

export interface AgentGridProps {
  agents: ScanAgentItem[];
  isLoading: boolean;
  isError: boolean;
  onSelectAgent: (agent: ScanAgentItem) => void;
  onRetry: () => void;
  onResetFilters: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function SkeletonCard() {
  return (
    <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-4 flex flex-col justify-between gap-3 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-xl bg-theme-bg-elevated" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-28 bg-theme-bg-elevated rounded" />
            <div className="h-2 w-16 bg-theme-bg-elevated rounded" />
          </div>
        </div>
        <div className="size-7 rounded-lg bg-theme-bg-elevated" />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="h-2.5 w-full bg-theme-bg-elevated rounded" />
        <div className="h-2.5 w-4/5 bg-theme-bg-elevated rounded" />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <div className="h-5 w-20 bg-theme-bg-elevated rounded-md" />
        <div className="h-5 w-16 bg-theme-bg-elevated rounded-md" />
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-theme-border-subtle">
        <div className="h-2.5 w-20 bg-theme-bg-elevated rounded" />
        <div className="h-2.5 w-12 bg-theme-bg-elevated rounded" />
      </div>
    </div>
  );
}

export const AgentGrid = memo(function AgentGrid({
  agents,
  isLoading,
  isError,
  onSelectAgent,
  onRetry,
  onResetFilters,
  page,
  totalPages,
  onPageChange,
}: AgentGridProps) {
  // 1. Loading Skeleton State
  if (isLoading && agents.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (isError && agents.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="size-12 rounded-2xl bg-theme-status-danger/10 border border-theme-status-danger/20 flex items-center justify-center text-theme-status-danger mb-3">
          <AlertTriangle className="size-6" />
        </div>
        <h2 className="text-sm font-bold text-theme-text-primary mb-1">
          {APP_CONTENT.marketplace.error.title}
        </h2>
        <p className="text-xs text-theme-text-secondary max-w-md mb-4 leading-relaxed">
          {APP_CONTENT.marketplace.error.subtitle}
        </p>
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onRetry}
          className="h-9 px-4 rounded-xl bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 border border-theme-border-subtle text-xs font-semibold text-theme-text-primary flex items-center gap-2 cursor-pointer transition-colors"
        >
          <RotateCw className="size-3.5 text-theme-brand-binance" />
          <span>{APP_CONTENT.marketplace.error.retryAction}</span>
        </motion.button>
      </div>
    );
  }

  // 3. Empty Results State
  if (!isLoading && agents.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="size-12 rounded-2xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center text-theme-text-muted mb-3">
          <SearchX className="size-6" />
        </div>
        <h2 className="text-sm font-bold text-theme-text-primary mb-1">
          {APP_CONTENT.marketplace.empty.title}
        </h2>
        <p className="text-xs text-theme-text-secondary max-w-md mb-4 leading-relaxed">
          {APP_CONTENT.marketplace.empty.subtitle}
        </p>
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onResetFilters}
          className="h-9 px-4 rounded-xl bg-theme-brand-binance text-theme-bg-overlay text-xs font-bold flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90 shadow-2xs"
        >
          <span>{APP_CONTENT.marketplace.empty.resetAction}</span>
        </motion.button>
      </div>
    );
  }

  // 4. Content Grid with Responsive Columns
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={`${agent.chain_id}-${agent.token_id}`}
            agent={agent}
            onSelect={onSelectAgent}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="w-full flex items-center justify-between pt-4 border-t border-theme-border-subtle">
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="h-9 px-3.5 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle text-xs font-semibold text-theme-text-secondary hover:text-theme-text-primary flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="size-4" />
            <span>Previous</span>
          </motion.button>

          <span className="text-xs font-medium text-theme-text-muted">
            Page <strong className="text-theme-text-primary">{page + 1}</strong> of{' '}
            <strong className="text-theme-text-primary">{totalPages}</strong>
          </span>

          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={() => onPageChange(page + 1)}
            disabled={page + 1 >= totalPages}
            className="h-9 px-3.5 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle text-xs font-semibold text-theme-text-secondary hover:text-theme-text-primary flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="size-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
});
