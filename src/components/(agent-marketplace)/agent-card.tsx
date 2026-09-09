'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Star,
  ArrowUpRight,
  Zap,
  Cpu,
  Bot,
  Activity,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { hoverLiftCard, tapScaleCard } from '@/constants/animation';
import { truncateAddress } from '@/lib/utils';
import type { ScanAgentItem } from '@/lib/8004scan/types';

export interface AgentCardProps {
  agent: ScanAgentItem;
  onSelect: (agent: ScanAgentItem) => void;
  isSpotlight?: boolean;
}

// Deterministic pastel gradient for agents without an avatar image
function getAvatarGradient(seed: string): string {
  const charCode = seed.charCodeAt(0) || 0;
  const gradients = [
    'from-amber-500/20 to-yellow-600/20 text-theme-brand-binance border-theme-brand-binance/30',
    'from-emerald-500/20 to-teal-600/20 text-theme-status-success border-theme-status-success/30',
    'from-sky-500/20 to-blue-600/20 text-theme-status-info border-theme-status-info/30',
    'from-violet-500/20 to-purple-600/20 text-purple-400 border-purple-500/30',
    'from-rose-500/20 to-pink-600/20 text-rose-400 border-rose-500/30',
  ];
  return gradients[charCode % gradients.length];
}

export const AgentCard = memo(function AgentCard({
  agent,
  onSelect,
  isSpotlight,
}: AgentCardProps) {
  const displayName = agent.name?.trim() || `Agent #${agent.token_id}`;
  const displayDescription =
    agent.description?.trim() || APP_CONTENT.marketplace.card.defaultDescription;
  const ownerDisplay = agent.owner_ens || truncateAddress(agent.owner_address);
  const avatarStyle = getAvatarGradient(agent.token_id);

  // Check protocols
  const isMCP = agent.supported_protocols?.some((p) => p.toUpperCase().includes('MCP'));
  const isA2A = agent.supported_protocols?.some((p) => p.toUpperCase().includes('A2A'));

  return (
    <motion.div
      whileHover={hoverLiftCard}
      whileTap={tapScaleCard}
      onClick={() => onSelect(agent)}
      className={`bg-gradient-to-b from-theme-bg-surface via-theme-bg-surface to-theme-bg-elevated/25 border rounded-2xl p-4 flex flex-col justify-between gap-3 cursor-pointer group transition-colors transition-shadow duration-150 shadow-2xs hover:shadow-md hover:shadow-theme-brand-binance/5 relative select-none ${
        isSpotlight
          ? 'border-theme-brand-binance/40 hover:border-theme-brand-binance ring-1 ring-theme-brand-binance/20'
          : 'border-theme-border-subtle hover:border-theme-brand-binance/50'
      }`}
    >
      {/* 1. Header: Avatar, Name & Quick Action */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Icon */}
          <div
            className={`size-11 rounded-xl bg-gradient-to-br border flex items-center justify-center font-extrabold text-xs shrink-0 overflow-hidden group-hover:border-theme-brand-binance/50 transition-colors duration-150 ${avatarStyle}`}
          >
            {agent.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={agent.image_url}
                alt={displayName}
                className="size-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Fallback to text initials on image 404
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span>{displayName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          {/* Name, Token ID & Owner */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-xs font-bold text-theme-text-primary group-hover:text-theme-brand-binance transition-colors duration-150 truncate">
                {displayName}
              </h3>
              {agent.is_verified && (
                <span title={APP_CONTENT.marketplace.card.verified}>
                  <CheckCircle2 className="size-3.5 text-theme-status-success shrink-0" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-2xs text-theme-text-muted mt-0.5">
              <span className="font-mono text-theme-brand-binance font-semibold">
                #{agent.token_id}
              </span>
              <span>•</span>
              <span className="truncate">{ownerDisplay}</span>
            </div>
          </div>
        </div>

        {/* Actions: Spotlight, Quick Hire, Inspect */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isSpotlight && (
            <span className="text-3xs font-extrabold px-1 py-px rounded-full bg-theme-brand-binance/15 text-theme-brand-binance border border-theme-brand-binance/30 uppercase tracking-wider">
              {APP_CONTENT.marketplace.card.spotlightTag}
            </span>
          )}

          <div className="size-7 rounded-lg bg-theme-bg-elevated/70 group-hover:bg-theme-brand-binance group-hover:text-theme-bg-overlay flex items-center justify-center text-theme-text-muted transition-colors duration-150 shrink-0">
            <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150" />
          </div>
        </div>
      </div>

      {/* 2. Description snippet with clean 2-line height */}
      <p className="text-2xs text-theme-text-secondary line-clamp-2 leading-relaxed min-h-[34px]">
        {displayDescription}
      </p>

      {/* 3. Capability Badges */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[22px]">
        {agent.x402_supported && (
          <span className="text-3xs font-bold px-1.5 py-px rounded-full bg-theme-brand-binance/10 text-theme-brand-binance border border-theme-brand-binance/25 flex items-center gap-1 shrink-0">
            <Zap className="size-2" />
            {APP_CONTENT.marketplace.card.x402Badge}
          </span>
        )}

        {isMCP && (
          <span className="text-3xs font-semibold px-1.5 py-px rounded-full bg-theme-status-info/10 text-theme-status-info border border-theme-status-info/25 flex items-center gap-1 shrink-0">
            <Cpu className="size-2" />
            {APP_CONTENT.marketplace.card.mcpBadge}
          </span>
        )}

        {isA2A && (
          <span className="text-3xs font-semibold px-1.5 py-px rounded-full bg-theme-status-success/10 text-theme-status-success border border-theme-status-success/25 flex items-center gap-1 shrink-0">
            <Bot className="size-2" />
            {APP_CONTENT.marketplace.card.a2aBadge}
          </span>
        )}

        {agent.rank && agent.rank <= 100 && (
          <span className="text-3xs font-mono font-semibold px-1 py-px rounded-full bg-theme-bg-elevated text-theme-text-muted border border-theme-border-subtle shrink-0">
            {APP_CONTENT.marketplace.card.rankPrefix}
            {agent.rank}
          </span>
        )}
      </div>

      {/* 4. Footer: Scores & Metrics */}
      <div className="flex items-center justify-between pt-2.5 border-t border-theme-border-subtle/70 text-2xs">
        {/* Total Score Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-theme-bg-elevated/70 border border-theme-border-subtle/80">
          <Star className="size-3 text-theme-brand-binance fill-theme-brand-binance/30" />
          <span className="text-theme-text-muted">{APP_CONTENT.marketplace.card.scoreLabel}:</span>
          <strong className="text-theme-text-primary font-mono">
            {agent.total_score && agent.total_score > 0
              ? agent.total_score.toFixed(1)
              : 'N/A'}
          </strong>
        </div>

        {/* Health Factor Badge */}
        <div className="flex items-center gap-1.5 text-theme-text-muted">
          {agent.health_score != null && agent.health_score > 0 ? (
            <div className="flex items-center gap-1 text-theme-status-success font-semibold">
              <Activity className="size-3" />
              <span>{agent.health_score.toFixed(0)}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-theme-status-success font-medium">
              <span className="size-1.5 rounded-full bg-theme-status-success" />
              <span>{APP_CONTENT.marketplace.card.activeStatus}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
