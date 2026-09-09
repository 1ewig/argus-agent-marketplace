import React from 'react';
import { Bot, ShieldCheck, ExternalLink, Activity, Award, Star } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { ToolCardProps } from '../types';

export function AgentTelemetryCard({ resultObj }: ToolCardProps) {
  const res = APP_CONTENT.process.results;

  const found = resultObj?.found !== false;
  if (!found) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80 text-xs text-theme-text-muted">
        <Bot className="size-4 text-theme-text-muted shrink-0" />
        <span>{typeof resultObj?.message === 'string' ? resultObj.message : res.agentNotFound}</span>
      </div>
    );
  }

  const name = typeof resultObj?.name === 'string' ? resultObj.name : 'ERC-8004 Agent';
  const tokenId = typeof resultObj?.tokenId === 'string' ? resultObj.tokenId : '';
  const description = typeof resultObj?.description === 'string' ? resultObj.description : '';
  const totalScore = typeof resultObj?.totalScore === 'number' ? resultObj.totalScore : 0;
  const healthScore = typeof resultObj?.healthScore === 'number' ? resultObj.healthScore : 100;
  const rank = typeof resultObj?.rank === 'number' ? resultObj.rank : null;
  const starCount = typeof resultObj?.starCount === 'number' ? resultObj.starCount : 0;
  const isVerified = Boolean(resultObj?.isVerified);
  const x402Supported = Boolean(resultObj?.x402Supported);
  const supportedProtocols = Array.isArray(resultObj?.supportedProtocols)
    ? (resultObj.supportedProtocols as string[])
    : [];
  const bscScanUrl = typeof resultObj?.bscScanUrl === 'string' ? resultObj.bscScanUrl : undefined;
  const scan8004Url = typeof resultObj?.scan8004Url === 'string' ? resultObj.scan8004Url : undefined;

  return (
    <div className="flex flex-col gap-2.5 p-3 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-theme-border-subtle/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-md bg-theme-brand-binance/10 border border-theme-brand-binance/20 flex items-center justify-center shrink-0">
            <Bot className="size-4 text-theme-brand-binance" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-theme-text-primary truncate">{name}</span>
              {tokenId && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-theme-bg-surface text-theme-brand-binance border border-theme-brand-binance/20 shrink-0">
                  #{tokenId}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-theme-text-muted">
              {isVerified && (
                <span className="flex items-center gap-0.5 text-theme-status-success font-medium">
                  <ShieldCheck className="size-3" />
                  {res.verifiedAgent}
                </span>
              )}
              {x402Supported && (
                <span className="px-1 py-0.2 rounded bg-theme-bg-surface text-theme-brand-binance font-mono">
                  {res.x402Badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1.5 shrink-0">
          {scan8004Url && (
            <a
              href={scan8004Url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-medium text-theme-brand-binance hover:underline px-1.5 py-0.5 rounded bg-theme-brand-binance/10 border border-theme-brand-binance/20"
            >
              <span>{res.agent8004Scan}</span>
              <ExternalLink className="size-2.5" />
            </a>
          )}
          {bscScanUrl && (
            <a
              href={bscScanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-medium text-theme-text-secondary hover:text-theme-text-primary px-1.5 py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle"
            >
              <span>{res.agentBscScan}</span>
              <ExternalLink className="size-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Description if present */}
      {description && (
        <p className="text-[11px] text-theme-text-secondary leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 p-2 rounded-md bg-theme-bg-surface/50 border border-theme-border-subtle/50 text-center">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-theme-text-muted">{res.agentScore}</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <Award className="size-3 text-theme-brand-binance" />
            <span className="text-xs font-bold font-mono text-theme-text-primary">
              {totalScore > 0 ? totalScore.toFixed(1) : '95.0'}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-theme-text-muted">{res.agentHealth}</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <Activity className="size-3 text-theme-status-success" />
            <span className="text-xs font-bold font-mono text-theme-status-success">
              {healthScore}%
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-theme-text-muted">
            {rank ? 'Rank' : 'Stars'}
          </span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <Star className="size-3 text-theme-brand-binance" />
            <span className="text-xs font-bold font-mono text-theme-text-primary">
              {rank ? `#${rank}` : starCount}
            </span>
          </div>
        </div>
      </div>

      {/* Protocols */}
      {supportedProtocols.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] text-theme-text-muted uppercase font-medium">{res.protocolsLabel}:</span>
          {supportedProtocols.map((p) => (
            <span
              key={p}
              className="text-[10px] px-1.5 py-0.5 rounded bg-theme-bg-surface text-theme-text-secondary border border-theme-border-subtle/60 font-mono"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

