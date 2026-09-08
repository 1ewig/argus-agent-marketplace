'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Award,
  Activity,
  Star,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { truncateAddress } from '@/lib/utils';
import type { ScanAgentItem } from '@/lib/8004scan/types';

export interface AgentCardProps {
  agent: ScanAgentItem;
  onSelect: (agent: ScanAgentItem) => void;
}

export const AgentCard = memo(function AgentCard({
  agent,
  onSelect,
}: AgentCardProps) {
  const displayName = agent.name?.trim() || `Agent #${agent.token_id}`;
  const displayDescription =
    agent.description?.trim() || APP_CONTENT.marketplace.card.defaultDescription;
  const ownerDisplay = agent.owner_ens || truncateAddress(agent.owner_address);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(agent)}
      className="bg-theme-bg-surface border border-theme-border-subtle hover:border-theme-brand-binance/40 rounded-xl p-4 flex flex-col justify-between gap-3 cursor-pointer group transition-all shadow-2xs hover:shadow-xs relative select-none"
    >
      {/* 1. Header: Avatar, Name & Verification Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar Icon */}
          <div className="size-10 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center font-bold text-xs text-theme-brand-binance shrink-0 group-hover:border-theme-brand-binance/40 transition-colors overflow-hidden">
            {agent.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={agent.image_url}
                alt={displayName}
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <span>{displayName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          {/* Name & Token ID */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-xs font-bold text-theme-text-primary group-hover:text-theme-brand-binance transition-colors truncate">
                {displayName}
              </h3>
              {agent.is_verified && (
                <span title={APP_CONTENT.marketplace.card.verified}>
                  <CheckCircle2 className="size-3.5 text-theme-status-success shrink-0" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-2xs text-theme-text-muted">
              <span>#{agent.token_id}</span>
              <span>•</span>
              <span className="truncate">{ownerDisplay}</span>
            </div>
          </div>
        </div>

        {/* Inspect Action Arrow */}
        <div className="size-7 rounded-lg bg-theme-bg-elevated/70 group-hover:bg-theme-brand-binance group-hover:text-theme-bg-overlay flex items-center justify-center text-theme-text-muted transition-colors shrink-0">
          <ArrowUpRight className="size-3.5" />
        </div>
      </div>

      {/* 2. Body: Description snippet */}
      <p className="text-2xs text-theme-text-secondary line-clamp-2 leading-relaxed h-8">
        {displayDescription}
      </p>

      {/* 3. Capability Badges */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {agent.x402_supported && (
          <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-theme-brand-binance/10 text-theme-brand-binance border border-theme-brand-binance/20 flex items-center gap-1">
            <Zap className="size-2.5" />
            {APP_CONTENT.marketplace.card.x402Badge}
          </span>
        )}

        {agent.supported_protocols && agent.supported_protocols.length > 0 && (
          <span className="text-2xs font-medium px-2 py-0.5 rounded-md bg-theme-bg-elevated text-theme-text-secondary border border-theme-border-subtle truncate max-w-[130px]">
            {agent.supported_protocols[0]}
          </span>
        )}

        {agent.rank && agent.rank <= 100 && (
          <span className="text-2xs font-semibold px-1.5 py-0.5 rounded-md bg-theme-status-info/10 text-theme-status-info border border-theme-status-info/20">
            {APP_CONTENT.marketplace.card.rankPrefix}
            {agent.rank}
          </span>
        )}
      </div>

      {/* 4. Footer: Metrics Bar */}
      <div className="flex items-center justify-between pt-2.5 border-t border-theme-border-subtle text-2xs text-theme-text-muted">
        {/* Total Score */}
        <div className="flex items-center gap-1">
          <Award className="size-3 text-theme-status-warning" />
          <span>
            {APP_CONTENT.marketplace.card.scoreLabel}:{' '}
            <strong className="text-theme-text-primary">
              {agent.total_score ? agent.total_score.toFixed(1) : '0.0'}
            </strong>
          </span>
        </div>

        {/* Health Factor / Star Count */}
        <div className="flex items-center gap-2">
          {agent.health_score != null ? (
            <div className="flex items-center gap-1">
              <Activity className="size-3 text-theme-status-success" />
              <span>{agent.health_score.toFixed(0)}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Star className="size-3 text-theme-status-warning fill-theme-status-warning/20" />
              <span>{agent.star_count ?? 0}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
