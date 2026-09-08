'use client';

import React, { memo, useCallback } from 'react';
import {
  AlertTriangle,
  RotateCw,
  SearchX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AgentCard } from './agent-card';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import type { ScanAgentItem } from '@/lib/8004scan/types';

export interface AgentGridProps {
  agents: ScanAgentItem[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  onSelectAgent: (agent: ScanAgentItem) => void;
  onRetry: () => void;
  onResetFilters: () => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function SkeletonCard() {
  return (
    <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-2xl p-4 flex flex-col justify-between gap-3 animate-pulse">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-theme-bg-elevated" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-28 bg-theme-bg-elevated rounded" />
            <div className="h-2.5 w-16 bg-theme-bg-elevated rounded" />
          </div>
        </div>
        <div className="size-7 rounded-lg bg-theme-bg-elevated" />
      </div>

      <div className="flex flex-col gap-1.5 min-h-[34px]">
        <div className="h-2.5 w-full bg-theme-bg-elevated rounded" />
        <div className="h-2.5 w-4/5 bg-theme-bg-elevated rounded" />
      </div>

      <div className="flex items-center gap-2 pt-1 min-h-[22px]">
        <div className="h-4.5 w-20 bg-theme-bg-elevated rounded-full" />
        <div className="h-4.5 w-16 bg-theme-bg-elevated rounded-full" />
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-theme-border-subtle/70">
        <div className="h-5 w-24 bg-theme-bg-elevated rounded-md" />
        <div className="h-3 w-12 bg-theme-bg-elevated rounded" />
      </div>
    </div>
  );
}

export const AgentGrid = memo(function AgentGrid({
  agents,
  totalCount,
  isLoading,
  isError,
  onSelectAgent,
  onRetry,
  onResetFilters,
  page,
  pageSize,
  totalPages,
  onPageChange,
}: AgentGridProps) {
  // Scroll smoothly to top on page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      onPageChange(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [onPageChange],
  );

  // 1. Loading Skeleton State
  if (isLoading && agents.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
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
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
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
          className="h-9.5 px-4 rounded-xl bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 border border-theme-border-subtle text-xs font-semibold text-theme-text-primary flex items-center gap-2 cursor-pointer transition-colors"
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
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
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
          className="h-9.5 px-4 rounded-xl bg-theme-brand-binance text-theme-bg-overlay text-xs font-bold flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90 shadow-2xs"
        >
          <span>{APP_CONTENT.marketplace.empty.resetAction}</span>
        </motion.button>
      </div>
    );
  }

  const startRange = page * pageSize + 1;
  const endRange = Math.min((page + 1) * pageSize, totalCount);

  // Pagination page pills window
  const pageNumbers: number[] = [];
  const maxWindow = 5;
  let startPage = Math.max(0, page - Math.floor(maxWindow / 2));
  const endPage = Math.min(totalPages - 1, startPage + maxWindow - 1);
  if (endPage - startPage + 1 < maxWindow) {
    startPage = Math.max(0, endPage - maxWindow + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // 4. Main Responsive Cards Grid & Header Ribbon
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-4">
      {/* Grid Status Ribbon */}
      <div className="flex items-center justify-between text-2xs text-theme-text-muted pb-1">
        <span className="font-medium">
          {APP_CONTENT.marketplace.grid.showingRange(startRange, endRange, totalCount)}
        </span>

        <span className="font-mono text-theme-text-secondary">
          {APP_CONTENT.marketplace.grid.pageIndicator(page + 1, totalPages)}
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={`${agent.chain_id}-${agent.token_id}`}
            agent={agent}
            onSelect={onSelectAgent}
          />
        ))}
      </div>

      {/* Comprehensive Pagination Footer */}
      {totalPages > 1 && (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-theme-border-subtle/80 mt-2">
          {/* Previous Stepper */}
          <div className="flex items-center gap-1.5">
            <motion.button
              type="button"
              whileTap={tapScalePill}
              onClick={() => handlePageChange(0)}
              disabled={page === 0}
              title="First page"
              className="size-9 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle text-theme-text-secondary hover:text-theme-text-primary flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="size-4" />
            </motion.button>

            <motion.button
              type="button"
              whileTap={tapScalePill}
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="h-9 px-3 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle text-xs font-semibold text-theme-text-secondary hover:text-theme-text-primary flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="size-4" />
              <span>{APP_CONTENT.marketplace.grid.previousPage}</span>
            </motion.button>
          </div>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((p) => {
              const isCurrent = p === page;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={`size-9 rounded-xl text-xs font-mono font-bold flex items-center justify-center cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-theme-brand-binance text-theme-bg-overlay shadow-2xs font-extrabold'
                      : 'bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 border border-theme-border-subtle text-theme-text-secondary hover:text-theme-text-primary'
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
          </div>

          {/* Next Stepper */}
          <div className="flex items-center gap-1.5">
            <motion.button
              type="button"
              whileTap={tapScalePill}
              onClick={() => handlePageChange(page + 1)}
              disabled={page + 1 >= totalPages}
              className="h-9 px-3 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle text-xs font-semibold text-theme-text-secondary hover:text-theme-text-primary flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span>{APP_CONTENT.marketplace.grid.nextPage}</span>
              <ChevronRight className="size-4" />
            </motion.button>

            <motion.button
              type="button"
              whileTap={tapScalePill}
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={page + 1 >= totalPages}
              title="Last page"
              className="size-9 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle text-theme-text-secondary hover:text-theme-text-primary flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="size-4" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
});
