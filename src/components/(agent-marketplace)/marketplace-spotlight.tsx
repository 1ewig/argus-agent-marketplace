'use client';

import React, { memo, useState } from 'react';
import { Sparkles, ArrowRight, Zap, Shield, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONTENT } from '@/constants/content';
import type { ScanAgentItem } from '@/lib/8004scan/types';

export interface MarketplaceSpotlightProps {
  hevoAgents: ScanAgentItem[];
  alphaAgents: ScanAgentItem[];
  onSelectAgent: (agent: ScanAgentItem) => void;
}

export const MarketplaceSpotlight = memo(function MarketplaceSpotlight({
  hevoAgents,
  alphaAgents,
  onSelectAgent,
}: MarketplaceSpotlightProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const topHevo = hevoAgents[0];
  const topAlpha = alphaAgents[0];

  if (!topHevo && !topAlpha) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-b from-theme-bg-surface via-theme-bg-surface/90 to-theme-bg-base/60 border-b border-theme-border-subtle px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Section Header with Collapse Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-md bg-theme-brand-binance/10 flex items-center justify-center text-theme-brand-binance">
              <Sparkles className="size-3 text-theme-brand-binance" />
            </div>
            <span className="text-2xs font-extrabold uppercase tracking-wider text-theme-brand-binance">
              {APP_CONTENT.marketplace.spotlight.sectionTitle}
            </span>
            <span className="text-2xs text-theme-text-muted hidden md:inline">
              — {APP_CONTENT.marketplace.spotlight.sectionSubtitle}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="text-2xs text-theme-text-muted hover:text-theme-text-primary flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>
              {isCollapsed
                ? APP_CONTENT.marketplace.spotlight.expandSpotlight
                : APP_CONTENT.marketplace.spotlight.collapseSpotlight}
            </span>
            {isCollapsed ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronUp className="size-3" />
            )}
          </button>
        </div>

        {/* Collapsible Spotlight Cards */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5 pb-1">
                {/* 1. Hevo Spotlight Card */}
                {topHevo && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => onSelectAgent(topHevo)}
                    className="bg-theme-bg-surface/90 hover:bg-theme-bg-elevated/40 border border-theme-border-subtle hover:border-theme-brand-binance/40 rounded-xl p-3 flex flex-col justify-between gap-2.5 cursor-pointer group shadow-2xs transition-all relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-theme-brand-binance/15 border border-theme-brand-binance/30 flex items-center justify-center text-theme-brand-binance font-bold shrink-0">
                          <Zap className="size-4 text-theme-brand-binance" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-theme-text-primary group-hover:text-theme-brand-binance transition-colors truncate">
                              {topHevo.name || 'Hevo Sentinel'}
                            </span>
                            <span className="text-3xs font-mono px-1.5 py-0.2 rounded bg-theme-bg-elevated text-theme-text-muted border border-theme-border-subtle">
                              #{topHevo.token_id}
                            </span>
                          </div>
                          <span className="text-2xs font-semibold text-theme-brand-binance block">
                            {APP_CONTENT.marketplace.spotlight.hevoTag}
                          </span>
                        </div>
                      </div>

                      <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-theme-brand-binance/15 text-theme-brand-binance border border-theme-brand-binance/25 uppercase shrink-0">
                        {APP_CONTENT.marketplace.spotlight.badge}
                      </span>
                    </div>

                    <p className="text-2xs text-theme-text-secondary line-clamp-1 leading-relaxed">
                      {topHevo.description || APP_CONTENT.marketplace.card.defaultDescription}
                    </p>

                    <div className="flex items-center justify-between pt-1.5 border-t border-theme-border-subtle/60 text-2xs">
                      <div className="flex items-center gap-1.5 text-theme-text-muted">
                        <Shield className="size-3 text-theme-status-success" />
                        <span className="font-semibold text-theme-status-success">
                          {topHevo.total_score && topHevo.total_score > 0
                            ? `Score: ${topHevo.total_score.toFixed(1)}`
                            : APP_CONTENT.marketplace.spotlight.benchmarkScore}
                        </span>
                      </div>

                      <div className="text-2xs font-semibold text-theme-brand-binance group-hover:text-theme-brand-accent flex items-center gap-1 transition-colors">
                        <span>{APP_CONTENT.marketplace.spotlight.inspectAction}</span>
                        <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. 4LPHA Spotlight Card */}
                {topAlpha && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => onSelectAgent(topAlpha)}
                    className="bg-theme-bg-surface/90 hover:bg-theme-bg-elevated/40 border border-theme-border-subtle hover:border-theme-status-info/40 rounded-xl p-3 flex flex-col justify-between gap-2.5 cursor-pointer group shadow-2xs transition-all relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-theme-status-info/15 border border-theme-status-info/30 flex items-center justify-center text-theme-status-info font-bold shrink-0">
                          <Sparkles className="size-4 text-theme-status-info" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-theme-text-primary group-hover:text-theme-status-info transition-colors truncate">
                              {topAlpha.name || 'Lending Agent 4 by 4LPHA'}
                            </span>
                            <span className="text-3xs font-mono px-1.5 py-0.2 rounded bg-theme-bg-elevated text-theme-text-muted border border-theme-border-subtle">
                              #{topAlpha.token_id}
                            </span>
                          </div>
                          <span className="text-2xs font-semibold text-theme-status-info block">
                            {APP_CONTENT.marketplace.spotlight.alphaTag}
                          </span>
                        </div>
                      </div>

                      <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-theme-status-info/15 text-theme-status-info border border-theme-status-info/25 uppercase shrink-0">
                        {APP_CONTENT.marketplace.spotlight.badge}
                      </span>
                    </div>

                    <p className="text-2xs text-theme-text-secondary line-clamp-1 leading-relaxed">
                      {topAlpha.description || APP_CONTENT.marketplace.card.defaultDescription}
                    </p>

                    <div className="flex items-center justify-between pt-1.5 border-t border-theme-border-subtle/60 text-2xs">
                      <div className="flex items-center gap-1.5 text-theme-text-muted">
                        <Shield className="size-3 text-theme-status-info" />
                        <span className="font-semibold text-theme-status-info">
                          {topAlpha.total_score && topAlpha.total_score > 0
                            ? `Score: ${topAlpha.total_score.toFixed(1)}`
                            : APP_CONTENT.marketplace.spotlight.benchmarkScore}
                        </span>
                      </div>

                      <div className="text-2xs font-semibold text-theme-status-info group-hover:text-theme-brand-accent flex items-center gap-1 transition-colors">
                        <span>{APP_CONTENT.marketplace.spotlight.inspectAction}</span>
                        <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
