'use client';

import React, { useState } from 'react';
import { ChatWindow } from '@/components/(dashboard)/chat/chat-window';
import { ArgusIcon } from '@/components/(dashboard)/argus-icon';
import { APP_CONTENT } from '@/constants/content';
import type { ExecutionMode } from '@/lib/types';

export default function Home() {
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('simulation');

  return (
    <main className="h-screen w-screen bg-theme-bg-base p-spacing-sm sm:p-spacing-md flex flex-col overflow-hidden">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col h-full min-h-0">
        {/* Top Minimal Brand & Controls Bar */}
        <header className="flex flex-wrap items-center justify-between gap-spacing-sm pb-spacing-sm border-b border-theme-border-subtle mb-spacing-sm shrink-0">
          {/* Brand & Track Identification */}
          <div className="flex items-center gap-spacing-xs">
            <ArgusIcon className="size-3.5 text-theme-brand-binance" />
            <span className="text-xs font-extrabold tracking-widest text-theme-text-primary uppercase">
              {APP_CONTENT.header.brand}
            </span>
            <span className="ml-spacing-xs px-spacing-xs py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle text-2xs text-theme-brand-binance font-bold">
              {APP_CONTENT.header.hackathonTrack}
            </span>
          </div>

          {/* Controls: Mode Switcher & Status */}
          <div className="flex items-center gap-spacing-sm">
            {/* Mode Selector (Simulation vs Live MCP) */}
            <div className="flex items-center gap-spacing-xs bg-theme-bg-surface p-0.5 rounded-lg border border-theme-border-subtle">
              <button
                type="button"
                onClick={() => setExecutionMode('simulation')}
                className={`text-2xs font-bold px-spacing-sm py-spacing-xs rounded-md transition-all cursor-pointer ${
                  executionMode === 'simulation'
                    ? 'bg-theme-bg-overlay text-theme-brand-binance shadow-2xs'
                    : 'text-theme-text-secondary hover:text-theme-text-primary'
                }`}
              >
                {APP_CONTENT.modes.simulation.label}
              </button>
              <button
                type="button"
                onClick={() => setExecutionMode('live_mcp')}
                className={`text-2xs font-bold px-spacing-sm py-spacing-xs rounded-md transition-all cursor-pointer ${
                  executionMode === 'live_mcp'
                    ? 'bg-theme-bg-overlay text-theme-brand-binance shadow-2xs'
                    : 'text-theme-text-secondary hover:text-theme-text-primary'
                }`}
              >
                {APP_CONTENT.modes.liveMcp.label}
              </button>
            </div>

            {/* Live Telemetry Indicator */}
            <div className="flex items-center gap-spacing-xs text-2xs font-mono text-theme-text-muted pl-spacing-xs">
              <span className="size-1.5 rounded-full bg-theme-status-success animate-pulse" />
              <span>{APP_CONTENT.header.mcpActive}</span>
            </div>
          </div>
        </header>

        {/* Central Agent Interaction Console */}
        <section className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <ChatWindow mode={executionMode} />
        </section>
      </div>
    </main>
  );
}
