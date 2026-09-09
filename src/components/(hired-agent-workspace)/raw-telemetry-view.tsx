'use client';

import React, { memo, useState, useCallback } from 'react';
import type { HiredAgentRecord } from '@/lib/types';

export interface RawTelemetryViewProps {
  data: HiredAgentRecord;
}

export const RawTelemetryView = memo(function RawTelemetryView({
  data,
}: RawTelemetryViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  return (
    <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-xl p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs pb-2 border-b border-theme-border-subtle/50">
        <span className="font-mono text-theme-text-muted">Local IndexedDB Node Snapshot</span>
        <button
          type="button"
          onClick={handleCopyJson}
          className="text-xs font-semibold text-theme-brand-binance hover:underline flex items-center gap-1 cursor-pointer"
        >
          {copied ? <span>Copied JSON!</span> : <span>Copy JSON</span>}
        </button>
      </div>
      <pre className="p-3.5 rounded-lg bg-theme-bg-elevated/70 border border-theme-border-subtle/50 font-mono text-2xs text-theme-text-secondary overflow-x-auto leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
});
