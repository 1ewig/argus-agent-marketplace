import React from 'react';
import { Bot, ExternalLink, Search } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { ToolCardProps } from '../types';

export function AgentSearchCard({ resultObj }: ToolCardProps) {
  const res = APP_CONTENT.process.results;
  const agents = Array.isArray(resultObj?.agents)
    ? (resultObj.agents as Array<{
        tokenId: string;
        name: string;
        description?: string;
        totalScore?: number;
        healthScore?: number;
        rank?: number | null;
        starCount?: number;
        supportedProtocols?: string[];
        x402Supported?: boolean;
        bscScanUrl?: string;
        scan8004Url?: string;
      }>)
    : [];

  const totalFound = typeof resultObj?.totalFound === 'number' ? resultObj.totalFound : agents.length;
  const query = typeof resultObj?.query === 'string' ? resultObj.query : '';
  const category = typeof resultObj?.category === 'string' && resultObj.category !== 'all' ? resultObj.category : '';

  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-theme-border-subtle/50 text-[10px]">
        <div className="flex items-center gap-1.5 truncate">
          <Search className="size-3 text-theme-brand-binance shrink-0" />
          <span className="font-semibold uppercase tracking-wider text-theme-text-muted truncate">
            {res.agentSearchHeader}
          </span>
          {(query || category) && (
            <span className="text-theme-text-muted truncate max-w-[160px]">
              &quot;{query || category}&quot;
            </span>
          )}
        </div>
        <span className="text-theme-text-muted font-mono shrink-0">
          {totalFound} {res.agentsFound}
        </span>
      </div>

      {/* Agents List */}
      {agents.length > 0 ? (
        <div className="flex flex-col gap-1.5 pt-0.5">
          {agents.map((agent) => {
            const score = agent.totalScore && agent.totalScore > 0 ? agent.totalScore.toFixed(1) : '95.0';
            const health = agent.healthScore ?? 100;

            return (
              <div
                key={agent.tokenId}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-theme-bg-surface/60 hover:bg-theme-bg-surface border border-theme-border-subtle/60 hover:border-theme-border-strong transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-6 rounded bg-theme-brand-binance/10 border border-theme-brand-binance/20 flex items-center justify-center shrink-0">
                    <Bot className="size-3 text-theme-brand-binance" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-theme-text-primary truncate">{agent.name}</span>
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-theme-bg-elevated text-theme-brand-binance">
                        #{agent.tokenId}
                      </span>
                      {agent.x402Supported && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-theme-brand-binance/15 text-theme-brand-binance font-mono">
                          x402
                        </span>
                      )}
                    </div>
                    {agent.description && (
                      <p className="text-[10px] text-theme-text-secondary truncate max-w-[280px]">
                        {agent.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-end text-[10px] font-mono">
                    <span className="text-theme-text-primary font-bold">{score} pts</span>
                    <span className="text-theme-status-success">{health}% HP</span>
                  </div>
                  {agent.scan8004Url && (
                    <a
                      href={agent.scan8004Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-theme-text-muted hover:text-theme-brand-binance hover:bg-theme-bg-elevated transition-colors"
                      title={res.agent8004Scan}
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <span className="text-theme-text-muted text-xs italic py-1">
          {res.noAgentsFound}
        </span>
      )}
    </div>
  );
}

