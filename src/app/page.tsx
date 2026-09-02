'use client';

import React, { useState } from 'react';
import { ChatWindow } from '@/components/stream/chat-window';
import { APP_CONTENT } from '@/constants/content';
import type { ExecutionMode } from '@/lib/types';

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState('SOLUSDT');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('simulation');

  return (
    <main className="h-screen w-screen bg-theme-bg-base p-spacing-sm sm:p-spacing-md flex flex-col overflow-hidden">
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col h-full min-h-0">
        {/* Top Minimal Brand & Controls Bar */}
        <header className="flex flex-wrap items-center justify-between gap-spacing-sm pb-spacing-sm border-b border-theme-border-subtle mb-spacing-sm shrink-0">
          {/* Brand & Track Identification */}
          <div className="flex items-center gap-spacing-xs">
            <div className="size-3 rounded-xs bg-theme-brand-binance" />
            <span className="text-xs font-extrabold tracking-widest text-theme-text-primary uppercase">
              {APP_CONTENT.header.brand}
            </span>
            <span className="ml-spacing-xs px-spacing-xs py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle text-2xs text-theme-brand-binance font-bold">
              {APP_CONTENT.header.hackathonTrack}
            </span>
          </div>

          {/* Controls: Target Pair & Mode Switcher */}
          <div className="flex flex-wrap items-center gap-spacing-sm">
            {/* Target Pair Selector */}
            <div className="flex items-center gap-spacing-xs bg-theme-bg-surface p-0.5 rounded-lg border border-theme-border-subtle">
              <span className="text-2xs font-bold text-theme-text-muted px-spacing-xs hidden sm:inline">
                {APP_CONTENT.header.activePairLabel}
              </span>
              {APP_CONTENT.pairs.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setSelectedSymbol(sym)}
                  className={`text-2xs font-mono font-bold px-spacing-sm py-spacing-xs rounded-md transition-all cursor-pointer ${
                    selectedSymbol === sym
                      ? 'bg-theme-bg-overlay text-theme-brand-binance shadow-2xs'
                      : 'text-theme-text-secondary hover:text-theme-text-primary'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>

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
            <div className="hidden md:flex items-center gap-spacing-xs text-2xs font-mono text-theme-text-muted pl-spacing-xs">
              <span className="size-1.5 rounded-full bg-theme-status-success animate-pulse" />
              <span>{APP_CONTENT.header.mcpActive}</span>
            </div>
          </div>
        </header>

        {/* Central Agent Interaction Console */}
        <section className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <ChatWindow
            symbol={selectedSymbol}
            mode={executionMode}
          />
        </section>
      </div>
    </main>
  );
}
