'use client';

import React, { memo, useState, useCallback } from 'react';
import {
  ExternalLink,
  ArrowUpRight,
  Copy,
  Check,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { truncateAddress } from '@/lib/utils';
import type { AgentMissionConfig } from '@/lib/types';

export interface MissionMandateCardProps {
  mission: AgentMissionConfig;
  contractAddress: string;
  ownerAddress: string;
  agentTokenId: string;
}

export const MissionMandateCard = memo(function MissionMandateCard({
  mission,
  contractAddress,
  ownerAddress,
  agentTokenId,
}: MissionMandateCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const bscScanContractUrl = `https://bscscan.com/token/${contractAddress}?a=${agentTokenId}`;
  const scan8004Url = `https://8004scan.io/agents/bsc/${agentTokenId}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Strategy & Risk Parameters */}
      <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-4 sm:p-5 flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
          {APP_CONTENT.hiredAgents.workspace.mandate.title}
        </span>

        <div className="flex items-center justify-between text-xs py-2 border-b border-theme-border-subtle/50">
          <span className="text-theme-text-secondary">
            {APP_CONTENT.hiredAgents.workspace.mandate.strategyType}
          </span>
          <span className="font-semibold text-theme-text-primary capitalize">
            {mission.strategyType.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs py-2 border-b border-theme-border-subtle/50">
          <span className="text-theme-text-secondary">
            {APP_CONTENT.hiredAgents.workspace.mandate.targetProtocol}
          </span>
          <span className="font-semibold text-theme-brand-binance">
            {mission.targetPairOrProtocol}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs py-2 border-b border-theme-border-subtle/50">
          <span className="text-theme-text-secondary">
            {APP_CONTENT.hiredAgents.workspace.mandate.interval}
          </span>
          <span className="font-mono text-theme-text-primary font-medium">
            Every {mission.executionIntervalMinutes} minutes
          </span>
        </div>

        {mission.healthFactorThreshold && (
          <div className="flex items-center justify-between text-xs py-2 border-b border-theme-border-subtle/50">
            <span className="text-theme-text-secondary">Health Factor Alert Threshold</span>
            <span className="font-mono font-semibold text-theme-status-warning">
              {mission.healthFactorThreshold}%
            </span>
          </div>
        )}

        {mission.gridUpperPrice && (
          <div className="flex items-center justify-between text-xs py-2 border-b border-theme-border-subtle/50">
            <span className="text-theme-text-secondary">Grid Range Bounds</span>
            <span className="font-mono font-semibold text-theme-text-primary">
              ${mission.gridLowerPrice} - ${mission.gridUpperPrice}
            </span>
          </div>
        )}

        {mission.rebalanceThresholdPct && (
          <div className="flex items-center justify-between text-xs py-2 border-b border-theme-border-subtle/50">
            <span className="text-theme-text-secondary">Rebalance Drift Threshold</span>
            <span className="font-mono font-semibold text-theme-brand-binance">
              ±{mission.rebalanceThresholdPct}%
            </span>
          </div>
        )}

        {mission.customPrompt && (
          <div className="flex flex-col gap-1.5 pt-1.5">
            <span className="text-2xs font-semibold text-theme-text-muted uppercase tracking-wider">
              Custom Directives
            </span>
            <p className="text-xs text-theme-text-secondary bg-theme-bg-elevated p-3 rounded-lg border border-theme-border-subtle/60 leading-relaxed">
              {mission.customPrompt}
            </p>
          </div>
        )}
      </div>

      {/* On-Chain Identity & Registry Links */}
      <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-4 sm:p-5 flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
          On-Chain Architecture (BNB Smart Chain)
        </span>

        <div className="flex items-center justify-between text-xs py-2 border-b border-theme-border-subtle/50">
          <span className="text-theme-text-secondary">
            {APP_CONTENT.hiredAgents.workspace.mandate.contractAddress}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-theme-text-primary font-medium">
              {truncateAddress(contractAddress)}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(contractAddress, 'contract')}
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

        <div className="flex items-center justify-between text-xs py-2 border-b border-theme-border-subtle/50">
          <span className="text-theme-text-secondary">
            {APP_CONTENT.hiredAgents.workspace.mandate.ownerAddress}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-theme-text-primary font-medium">
              {truncateAddress(ownerAddress)}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(ownerAddress, 'owner')}
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

        <div className="flex items-center justify-between text-xs py-2 border-b border-theme-border-subtle/50">
          <span className="text-theme-text-secondary">Execution Standard</span>
          <span className="font-mono text-theme-brand-binance font-semibold">
            ERC-8004 / ERC-8183 / x402
          </span>
        </div>

        {/* External Explorer Links */}
        <div className="flex items-center gap-4 pt-3">
          <a
            href={bscScanContractUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-theme-text-secondary hover:text-theme-text-primary flex items-center gap-1.5 transition-colors"
          >
            <span>Verify on BscScan</span>
            <ExternalLink className="size-3.5 text-theme-text-muted" />
          </a>

          <a
            href={scan8004Url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-theme-text-secondary hover:text-theme-brand-binance flex items-center gap-1.5 transition-colors"
          >
            <span>View 8004scan Profile</span>
            <ArrowUpRight className="size-3.5 text-theme-brand-binance" />
          </a>
        </div>
      </div>
    </div>
  );
});
