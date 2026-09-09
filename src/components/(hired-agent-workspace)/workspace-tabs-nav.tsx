'use client';

import React, { memo } from 'react';
import { Activity, FileText, Terminal } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export type WorkspaceTabKey = 'timeline' | 'mandate' | 'telemetry';

export interface WorkspaceTabsNavProps {
  activeTab: WorkspaceTabKey;
  onChangeTab: (tab: WorkspaceTabKey) => void;
  logsCount: number;
}

export const WorkspaceTabsNav = memo(function WorkspaceTabsNav({
  activeTab,
  onChangeTab,
  logsCount,
}: WorkspaceTabsNavProps) {
  return (
    <div className="flex items-center gap-1 border-b border-theme-border-subtle pb-1">
      <button
        type="button"
        onClick={() => onChangeTab('timeline')}
        className={`h-8 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
          activeTab === 'timeline'
            ? 'bg-theme-brand-binance text-theme-bg-overlay font-bold shadow-2xs'
            : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated'
        }`}
      >
        <Activity className="size-3.5" />
        <span>{APP_CONTENT.hiredAgents.workspace.tabs.timeline}</span>
        <span className="text-2xs font-mono ml-1 px-1.5 py-0.5 rounded bg-black/15">
          {logsCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChangeTab('mandate')}
        className={`h-8 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
          activeTab === 'mandate'
            ? 'bg-theme-brand-binance text-theme-bg-overlay font-bold shadow-2xs'
            : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated'
        }`}
      >
        <FileText className="size-3.5" />
        <span>{APP_CONTENT.hiredAgents.workspace.tabs.overview}</span>
      </button>

      <button
        type="button"
        onClick={() => onChangeTab('telemetry')}
        className={`h-8 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
          activeTab === 'telemetry'
            ? 'bg-theme-brand-binance text-theme-bg-overlay font-bold shadow-2xs'
            : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated'
        }`}
      >
        <Terminal className="size-3.5" />
        <span>{APP_CONTENT.hiredAgents.workspace.tabs.terminal}</span>
      </button>
    </div>
  );
});
