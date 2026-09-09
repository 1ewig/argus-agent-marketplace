'use client';

import React, { memo, useState, useCallback } from 'react';
import {
  Shield,
  Zap,
  Bot,
  Copy,
  Check,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { ExecutionLogEntry } from '@/lib/types';

export interface ExecutionTimelineProps {
  logs: ExecutionLogEntry[];
}

export const ExecutionTimeline = memo(function ExecutionTimeline({
  logs,
}: ExecutionTimelineProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  if (logs.length === 0) {
    return (
      <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-8 text-center">
        <span className="text-xs text-theme-text-muted">
          {APP_CONTENT.hiredAgents.workspace.logs.emptyDesc}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {logs.map((log) => {
        const isAlert = log.type === 'alert';
        const isAction = log.type === 'action';

        return (
          <div
            key={log.id}
            className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-3.5 flex items-start gap-3 transition-colors hover:border-theme-border-subtle/80"
          >
            <div
              className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                isAlert
                  ? 'bg-theme-status-warning/15 text-theme-status-warning border border-theme-status-warning/30'
                  : isAction
                    ? 'bg-theme-brand-binance/15 text-theme-brand-binance border border-theme-brand-binance/30'
                    : 'bg-theme-bg-elevated text-theme-text-muted border border-theme-border-subtle'
              }`}
            >
              {isAlert ? (
                <Shield className="size-4" />
              ) : isAction ? (
                <Zap className="size-4" />
              ) : (
                <Bot className="size-4" />
              )}
            </div>

            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-semibold text-theme-text-primary truncate">
                  {log.title}
                </span>
                <span className="text-2xs text-theme-text-muted font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <p className="text-xs text-theme-text-secondary leading-relaxed">
                {log.detail}
              </p>

              {/* Transaction Hash and Gas Info */}
              {(log.txHash || log.gasUsedEth) && (
                <div className="flex flex-wrap items-center gap-2.5 pt-1.5 mt-1 border-t border-theme-border-subtle/40 text-2xs">
                  {log.txHash && (
                    <div className="flex items-center gap-1.5 font-mono text-theme-text-muted">
                      <span>Tx:</span>
                      <span className="text-theme-brand-binance font-medium truncate max-w-[140px] sm:max-w-[220px]">
                        {log.txHash}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(log.txHash!, log.id)}
                        className="text-theme-text-muted hover:text-theme-text-primary cursor-pointer transition-colors"
                      >
                        {copiedKey === log.id ? (
                          <Check className="size-3 text-theme-status-success" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                  )}

                  {log.gasUsedEth && (
                    <span className="text-theme-text-muted font-mono">
                      Gas: {log.gasUsedEth}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});
