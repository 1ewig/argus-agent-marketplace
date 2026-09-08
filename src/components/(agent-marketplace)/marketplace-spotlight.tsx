'use client';

import React, { memo } from 'react';
import { Sparkles, ArrowRight, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
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
  const topHevo = hevoAgents[0];
  const topAlpha = alphaAgents[0];

  if (!topHevo && !topAlpha) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-theme-bg-surface via-theme-bg-elevated/40 to-theme-bg-surface border-b border-theme-border-subtle px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-theme-brand-binance" />
            <span className="text-xs font-bold uppercase tracking-wider text-theme-brand-binance">
              {APP_CONTENT.marketplace.spotlight.sectionTitle}
            </span>
            <span className="text-2xs text-theme-text-muted hidden sm:inline">
              — {APP_CONTENT.marketplace.spotlight.sectionSubtitle}
            </span>
          </div>
        </div>

        {/* Spotlight Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {topHevo && (
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="bg-theme-bg-surface/80 border border-theme-border-subtle hover:border-theme-brand-binance/40 rounded-xl p-3.5 flex flex-col justify-between gap-3 relative overflow-hidden group shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-lg bg-theme-brand-binance/10 border border-theme-brand-binance/30 flex items-center justify-center text-theme-brand-binance font-bold text-xs shrink-0">
                    <Zap className="size-4.5 text-theme-brand-binance" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-theme-text-primary group-hover:text-theme-brand-binance transition-colors">
                        {topHevo.name || 'Hevo Protocol Agent'}
                      </span>
                      <span className="text-2xs font-semibold px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-text-muted border border-theme-border-subtle">
                        #{topHevo.token_id}
                      </span>
                    </div>
                    <span className="text-2xs text-theme-brand-binance font-medium">
                      {APP_CONTENT.marketplace.spotlight.hevoTag}
                    </span>
                  </div>
                </div>

                <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-theme-brand-binance/15 text-theme-brand-binance border border-theme-brand-binance/20 uppercase shrink-0">
                  {APP_CONTENT.marketplace.spotlight.badge}
                </span>
              </div>

              <p className="text-2xs text-theme-text-secondary line-clamp-2 leading-relaxed">
                {topHevo.description || APP_CONTENT.marketplace.card.defaultDescription}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-theme-border-subtle/60">
                <div className="flex items-center gap-2 text-2xs text-theme-text-muted">
                  <Award className="size-3 text-theme-status-warning" />
                  <span>
                    {APP_CONTENT.marketplace.card.scoreLabel}:{' '}
                    <strong className="text-theme-text-primary">
                      {topHevo.total_score ? topHevo.total_score.toFixed(1) : 'N/A'}
                    </strong>
                  </span>
                </div>

                <motion.button
                  type="button"
                  whileTap={tapScalePill}
                  onClick={() => onSelectAgent(topHevo)}
                  className="text-2xs font-semibold text-theme-brand-binance hover:text-theme-brand-accent flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{APP_CONTENT.marketplace.spotlight.inspectAction}</span>
                  <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {topAlpha && (
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="bg-theme-bg-surface/80 border border-theme-border-subtle hover:border-theme-brand-binance/40 rounded-xl p-3.5 flex flex-col justify-between gap-3 relative overflow-hidden group shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-lg bg-theme-status-info/10 border border-theme-status-info/30 flex items-center justify-center text-theme-status-info font-bold text-xs shrink-0">
                    <Sparkles className="size-4.5 text-theme-status-info" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-theme-text-primary group-hover:text-theme-brand-binance transition-colors">
                        {topAlpha.name || '4LPHA Intelligence'}
                      </span>
                      <span className="text-2xs font-semibold px-1.5 py-0.5 rounded bg-theme-bg-elevated text-theme-text-muted border border-theme-border-subtle">
                        #{topAlpha.token_id}
                      </span>
                    </div>
                    <span className="text-2xs text-theme-status-info font-medium">
                      {APP_CONTENT.marketplace.spotlight.alphaTag}
                    </span>
                  </div>
                </div>

                <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-theme-brand-binance/15 text-theme-brand-binance border border-theme-brand-binance/20 uppercase shrink-0">
                  {APP_CONTENT.marketplace.spotlight.badge}
                </span>
              </div>

              <p className="text-2xs text-theme-text-secondary line-clamp-2 leading-relaxed">
                {topAlpha.description || APP_CONTENT.marketplace.card.defaultDescription}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-theme-border-subtle/60">
                <div className="flex items-center gap-2 text-2xs text-theme-text-muted">
                  <Award className="size-3 text-theme-status-warning" />
                  <span>
                    {APP_CONTENT.marketplace.card.scoreLabel}:{' '}
                    <strong className="text-theme-text-primary">
                      {topAlpha.total_score ? topAlpha.total_score.toFixed(1) : 'N/A'}
                    </strong>
                  </span>
                </div>

                <motion.button
                  type="button"
                  whileTap={tapScalePill}
                  onClick={() => onSelectAgent(topAlpha)}
                  className="text-2xs font-semibold text-theme-brand-binance hover:text-theme-brand-accent flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{APP_CONTENT.marketplace.spotlight.inspectAction}</span>
                  <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
});
