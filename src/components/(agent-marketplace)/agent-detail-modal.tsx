'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Award,
  Activity,
  Star,
  Zap,
  MessageSquare,
  Shield,
  Layers,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import { truncateAddress, resolveAgentImageUrl } from '@/lib/utils';
import { get8004ScanAgentUrl } from '@/lib/8004scan/categories';
import type { ScanAgentItem } from '@/lib/8004scan/types';

export interface AgentDetailModalProps {
  agent: ScanAgentItem | null;
  onClose: () => void;
  onAnalyzeInChat: (prompt: string, agentName?: string) => void;
  onHireAgent?: (agent: ScanAgentItem) => void;
}

export const AgentDetailModal = memo(function AgentDetailModal({
  agent,
  onClose,
  onAnalyzeInChat,
  onHireAgent,
}: AgentDetailModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  if (!agent) return null;

  const displayName = agent.name?.trim() || `Agent #${agent.token_id}`;
  const displayDescription =
    agent.description?.trim() || APP_CONTENT.marketplace.card.defaultDescription;
  const bscScanUrl = `https://bscscan.com/token/${agent.contract_address}?a=${agent.token_id}`;
  const scan8004Url = get8004ScanAgentUrl(agent.chain_id, agent.token_id);
  const resolvedImageUrl = resolveAgentImageUrl(agent.image_url);

  const handleStartAnalysis = () => {
    const prompt = APP_CONTENT.marketplace.modal.chatPromptText(
      displayName,
      agent.token_id,
    );
    onAnalyzeInChat(prompt, displayName);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-theme-bg-overlay/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-theme-bg-surface border border-theme-border-subtle rounded-2xl shadow-xl flex flex-col overflow-hidden z-10"
        >
          {/* 1. Modal Header */}
          <div className="p-4 sm:p-5 border-b border-theme-border-subtle flex items-start justify-between gap-4 bg-theme-bg-surface shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-12 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center font-bold text-sm text-theme-brand-binance shrink-0 overflow-hidden relative">
                {resolvedImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolvedImageUrl}
                    alt={displayName}
                    className="size-full object-cover absolute inset-0 z-1"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <span>{displayName.slice(0, 2).toUpperCase()}</span>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-theme-text-primary truncate">
                    {displayName}
                  </h2>
                  {agent.is_verified && (
                    <CheckCircle2 className="size-4 text-theme-status-success shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-2xs text-theme-text-muted mt-0.5">
                  <span className="font-semibold text-theme-brand-binance">
                    #{agent.token_id}
                  </span>
                  <span>•</span>
                  <span>{APP_CONTENT.marketplace.modal.badge}</span>
                  <span>•</span>
                  <span>BNB Chain (56)</span>
                </div>
              </div>
            </div>

            <motion.button
              type="button"
              whileTap={tapScalePill}
              onClick={onClose}
              title={APP_CONTENT.marketplace.modal.closeModal}
              className="size-8 rounded-lg bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 flex items-center justify-center text-theme-text-muted hover:text-theme-text-primary cursor-pointer transition-colors shrink-0"
            >
              <X className="size-4" />
            </motion.button>
          </div>

          {/* 2. Scrollable Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 text-xs">
            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                Agent Overview & Mission
              </span>
              <p className="text-theme-text-secondary leading-relaxed bg-theme-bg-elevated/30 p-3 rounded-xl border border-theme-border-subtle/60 text-xs">
                {displayDescription}
              </p>
            </div>

            {/* Diagnostics & Performance Grid */}
            <div className="flex flex-col gap-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                {APP_CONTENT.marketplace.modal.telemetryTitle}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-theme-bg-elevated/50 p-3 rounded-xl border border-theme-border-subtle flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-2xs text-theme-text-muted">
                    <Award className="size-3 text-theme-status-warning" />
                    <span>{APP_CONTENT.marketplace.modal.totalScore}</span>
                  </div>
                  <span className="text-base font-bold text-theme-text-primary">
                    {agent.total_score ? agent.total_score.toFixed(1) : 'N/A'}
                  </span>
                </div>

                <div className="bg-theme-bg-elevated/50 p-3 rounded-xl border border-theme-border-subtle flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-2xs text-theme-text-muted">
                    <Activity className="size-3 text-theme-status-success" />
                    <span>{APP_CONTENT.marketplace.modal.healthScore}</span>
                  </div>
                  <span className="text-base font-bold text-theme-text-primary">
                    {agent.health_score != null
                      ? `${agent.health_score.toFixed(0)}%`
                      : 'Active'}
                  </span>
                </div>

                <div className="bg-theme-bg-elevated/50 p-3 rounded-xl border border-theme-border-subtle flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-2xs text-theme-text-muted">
                    <Star className="size-3 text-theme-status-warning" />
                    <span>{APP_CONTENT.marketplace.modal.averageScore}</span>
                  </div>
                  <span className="text-base font-bold text-theme-text-primary">
                    {agent.average_score ? agent.average_score.toFixed(1) : '5.0'}
                  </span>
                </div>

                <div className="bg-theme-bg-elevated/50 p-3 rounded-xl border border-theme-border-subtle flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-2xs text-theme-text-muted">
                    <Layers className="size-3 text-theme-status-info" />
                    <span>{APP_CONTENT.marketplace.modal.totalFeedbacks}</span>
                  </div>
                  <span className="text-base font-bold text-theme-text-primary">
                    {agent.total_feedbacks ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Protocol Capabilities */}
            <div className="flex flex-col gap-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                {APP_CONTENT.marketplace.modal.supportedProtocols}
              </span>
              <div className="flex flex-wrap gap-2">
                {agent.x402_supported && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-theme-brand-binance/10 text-theme-brand-binance border border-theme-brand-binance/25 flex items-center gap-1.5">
                    <Zap className="size-3" />
                    {APP_CONTENT.marketplace.card.x402Badge}
                  </span>
                )}
                {agent.supported_protocols && agent.supported_protocols.length > 0 ? (
                  agent.supported_protocols.map((protocol, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-theme-bg-elevated text-theme-text-secondary border border-theme-border-subtle flex items-center gap-1.5"
                    >
                      <Shield className="size-3 text-theme-status-info" />
                      {protocol}
                    </span>
                  ))
                ) : (
                  <span className="text-2xs text-theme-text-muted">
                    {APP_CONTENT.marketplace.card.noProtocols}
                  </span>
                )}
              </div>
            </div>

            {/* On-Chain Addresses */}
            <div className="flex flex-col gap-2 bg-theme-bg-elevated/40 p-3.5 rounded-xl border border-theme-border-subtle">
              <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                On-Chain Architecture
              </span>

              <div className="flex items-center justify-between text-2xs py-1 border-b border-theme-border-subtle/50">
                <span className="text-theme-text-muted">
                  {APP_CONTENT.marketplace.modal.contractAddress}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-theme-text-primary font-medium">
                    {truncateAddress(agent.contract_address)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(agent.contract_address, 'contract')}
                    className="text-theme-text-muted hover:text-theme-text-primary cursor-pointer transition-colors"
                  >
                    {copiedKey === 'contract' ? (
                      <Check className="size-3 text-theme-status-success" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-2xs py-1 border-b border-theme-border-subtle/50">
                <span className="text-theme-text-muted">
                  {APP_CONTENT.marketplace.modal.ownerAddress}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-theme-text-primary font-medium">
                    {agent.owner_ens || truncateAddress(agent.owner_address)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(agent.owner_address, 'owner')}
                    className="text-theme-text-muted hover:text-theme-text-primary cursor-pointer transition-colors"
                  >
                    {copiedKey === 'owner' ? (
                      <Check className="size-3 text-theme-status-success" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-2xs py-1">
                <span className="text-theme-text-muted">
                  {APP_CONTENT.marketplace.modal.registeredAt}
                </span>
                <span className="text-theme-text-secondary">
                  {new Date(agent.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Modal Footer: Actions & External Links */}
          <div className="p-4 sm:p-5 border-t border-theme-border-subtle bg-theme-bg-surface flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            {/* External Registry Links */}
            <div className="flex items-center gap-3">
              <a
                href={bscScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xs font-semibold text-theme-text-secondary hover:text-theme-text-primary flex items-center gap-1 transition-colors"
              >
                <span>{APP_CONTENT.marketplace.modal.viewBscScan}</span>
                <ExternalLink className="size-3 text-theme-text-muted" />
              </a>

              <a
                href={scan8004Url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xs font-semibold text-theme-text-secondary hover:text-theme-brand-binance flex items-center gap-1 transition-colors"
              >
                <span>{APP_CONTENT.marketplace.modal.view8004Scan}</span>
                <ExternalLink className="size-3 text-theme-brand-binance" />
              </a>
            </div>

            {/* Actions: Analyze & Hire */}
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                whileTap={tapScalePill}
                onClick={handleStartAnalysis}
                className="h-9.5 px-3.5 rounded-xl bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 border border-theme-border-subtle text-theme-text-secondary hover:text-theme-text-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <MessageSquare className="size-3.5 text-theme-text-muted" />
                <span>{APP_CONTENT.marketplace.modal.chatPromptAction}</span>
              </motion.button>

              {onHireAgent && (
                <motion.button
                  type="button"
                  whileTap={tapScalePill}
                  onClick={() => onHireAgent(agent)}
                  className="h-9.5 px-4 rounded-xl bg-theme-brand-binance text-theme-bg-overlay text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:opacity-95 transition-opacity"
                >
                  <Zap className="size-3.5" />
                  <span>Hire Agent</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
