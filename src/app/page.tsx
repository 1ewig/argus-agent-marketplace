'use client';

import React, { useState } from 'react';
import { CockpitOverview } from '@/components/cockpit/cockpit-overview';
import { ChatWindow } from '@/components/stream/chat-window';
import type { ExecutionMode } from '@/lib/types';

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState('SOLUSDT');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('simulation');

  return (
    <main className="h-screen w-screen bg-theme-bg-base p-spacing-md flex flex-col overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col h-full min-h-0">
        {/* Top Minimal Brand Bar */}
        <div className="flex items-center justify-between pb-spacing-sm border-b border-theme-border-subtle mb-spacing-md">
          <div className="flex items-center gap-spacing-xs">
            <div className="size-3 rounded-xs bg-theme-brand-binance" />
            <span className="text-xs font-extrabold tracking-widest text-theme-text-primary uppercase">
              ARGUS // BINANCE AGENT OS
            </span>
          </div>

          <div className="flex items-center gap-spacing-md text-2xs font-mono text-theme-text-muted">
            <span className="flex items-center gap-spacing-xs">
              <span className="size-1.5 rounded-full bg-theme-status-success animate-pulse" />
              <span>MCP SERVER: ACTIVE</span>
            </span>
            <span className="hidden sm:inline">INFERENCE: GROQ ULTRA-FAST</span>
            <span className="px-spacing-sm py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle text-theme-brand-binance font-bold">
              TRACK A
            </span>
          </div>
        </div>

        {/* Responsive Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-spacing-md flex-1 min-h-0 pb-spacing-xs">
          {/* Left Half: Mission Cockpit & Telemetry Overview */}
          <div className="h-full flex flex-col min-h-0 overflow-hidden">
            <CockpitOverview
              selectedSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
              executionMode={executionMode}
              onToggleMode={setExecutionMode}
            />
          </div>

          {/* Right Half: Interactive AI Chat Window & Agent Intelligence Stream */}
          <div className="h-full flex flex-col min-h-0 overflow-hidden">
            <ChatWindow
              symbol={selectedSymbol}
              mode={executionMode}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
