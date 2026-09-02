'use client';

import React from 'react';
import { ShieldCheck, Activity, Cpu, Zap, Wallet } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { ExecutionMode } from '@/lib/types';

interface CockpitOverviewProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  executionMode: ExecutionMode;
  onToggleMode: (mode: ExecutionMode) => void;
}

const DEFAULT_PRICES: Record<string, number> = {
  SOLUSDT: 99.44,
  BTCUSDT: 64250.0,
  ETHUSDT: 2580.0,
};

export function CockpitOverview({
  selectedSymbol,
  onSelectSymbol,
  executionMode,
  onToggleMode,
}: CockpitOverviewProps) {
  const tickerPrice = DEFAULT_PRICES[selectedSymbol] ?? 99.44;

  return (
    <div className="flex flex-col gap-spacing-md h-full overflow-y-auto pr-spacing-xs">
      {/* Top Protocol Header Card */}
      <div className="p-spacing-md bg-theme-bg-surface border border-theme-border-subtle rounded-lg shadow-sm">
        <div className="flex items-center justify-between gap-spacing-sm mb-spacing-xs">
          <div className="flex items-center gap-spacing-xs">
            <div className="size-2 rounded-full bg-theme-brand-binance" />
            <span className="text-2xs font-extrabold uppercase tracking-widest text-theme-text-muted">
              {APP_CONTENT.header.badge}
            </span>
          </div>
          <span className="text-2xs font-bold px-spacing-sm py-spacing-xs rounded-full bg-theme-bg-elevated border border-theme-border-subtle text-theme-status-success">
            {APP_CONTENT.cockpit.systemOnline}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-spacing-xs">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-theme-text-primary">
              {APP_CONTENT.header.title}
            </h1>
            <p className="text-xs text-theme-text-secondary mt-0.5">
              {APP_CONTENT.header.subtitle}
            </p>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center gap-spacing-xs bg-theme-bg-elevated p-0.5 rounded-lg border border-theme-border-subtle">
            <button
              type="button"
              onClick={() => onToggleMode('simulation')}
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
              onClick={() => onToggleMode('live_mcp')}
              className={`text-2xs font-bold px-spacing-sm py-spacing-xs rounded-md transition-all cursor-pointer ${
                executionMode === 'live_mcp'
                  ? 'bg-theme-bg-overlay text-theme-brand-binance shadow-2xs'
                  : 'text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              {APP_CONTENT.modes.liveMcp.label}
            </button>
          </div>
        </div>
      </div>

      {/* Target Asset Selector & Live Ticker Deck */}
      <div className="p-spacing-md bg-theme-bg-surface border border-theme-border-subtle rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-spacing-sm">
          <span className="text-2xs font-extrabold text-theme-text-muted uppercase tracking-wider">
            {APP_CONTENT.cockpit.activePairLabel}
          </span>
          <div className="flex items-baseline gap-spacing-xs">
            <span className="text-lg font-bold font-mono text-theme-text-primary">
              ${tickerPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-2xs font-bold font-mono text-theme-status-success">
              +3.42%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-spacing-sm">
          {APP_CONTENT.cockpit.symbols.map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => onSelectSymbol(sym)}
              className={`p-spacing-sm rounded-lg border text-center font-mono text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                selectedSymbol === sym
                  ? 'bg-theme-bg-overlay text-theme-brand-binance border-theme-border-strong shadow-xs'
                  : 'bg-theme-bg-elevated text-theme-text-primary border-theme-border-subtle hover:bg-theme-bg-base hover:border-theme-border-strong'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* System Telemetry Metrics Deck */}
      <div className="grid grid-cols-3 gap-spacing-sm">
        <div className="p-spacing-sm px-spacing-md bg-theme-bg-surface border border-theme-border-subtle rounded-lg shadow-sm text-center">
          <div className="flex items-center justify-center text-theme-brand-binance mb-spacing-xs">
            <Zap className="size-4" />
          </div>
          <span className="text-2xs text-theme-text-muted block font-bold tracking-wide">
            {APP_CONTENT.cockpit.stats.latency}
          </span>
          <span className="text-sm font-bold text-theme-text-primary mt-0.5 block font-mono">
            {APP_CONTENT.cockpit.stats.latencyValue}
          </span>
        </div>

        <div className="p-spacing-sm px-spacing-md bg-theme-bg-surface border border-theme-border-subtle rounded-lg shadow-sm text-center">
          <div className="flex items-center justify-center text-theme-status-info mb-spacing-xs">
            <Cpu className="size-4" />
          </div>
          <span className="text-2xs text-theme-text-muted block font-bold tracking-wide">
            {APP_CONTENT.cockpit.stats.settlement}
          </span>
          <span className="text-sm font-bold text-theme-text-primary mt-0.5 block font-mono">
            {APP_CONTENT.cockpit.stats.settlementValue}
          </span>
        </div>

        <div className="p-spacing-sm px-spacing-md bg-theme-bg-surface border border-theme-border-subtle rounded-lg shadow-sm text-center">
          <div className="flex items-center justify-center text-theme-status-success mb-spacing-xs">
            <ShieldCheck className="size-4" />
          </div>
          <span className="text-2xs text-theme-text-muted block font-bold tracking-wide">
            {APP_CONTENT.cockpit.stats.governance}
          </span>
          <span className="text-sm font-bold text-theme-text-primary mt-0.5 block font-mono">
            {APP_CONTENT.cockpit.stats.governanceValue}
          </span>
        </div>
      </div>

      {/* Multi-Agent Protocol Matrix Deck */}
      <div className="p-spacing-md bg-theme-bg-surface border border-theme-border-subtle rounded-lg shadow-sm flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-spacing-xs mb-spacing-xs">
            <Activity className="size-4 text-theme-brand-binance" />
            <h3 className="text-xs font-bold text-theme-text-primary uppercase tracking-wide">
              {APP_CONTENT.cockpit.overviewTitle}
            </h3>
          </div>
          <p className="text-xs text-theme-text-secondary leading-relaxed mb-spacing-md">
            {APP_CONTENT.cockpit.overviewDescription}
          </p>

          <div className="flex flex-col gap-spacing-xs">
            {/* Agent 1: Scout */}
            <div className="p-spacing-sm px-spacing-md rounded-lg bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-spacing-xs">
                <div className="size-2 rounded-full bg-theme-status-info" />
                <span className="font-bold text-theme-text-primary">
                  {APP_CONTENT.agents.analyst.name}
                </span>
              </div>
              <span className="text-2xs text-theme-text-secondary">
                {APP_CONTENT.agents.analyst.role}
              </span>
            </div>

            {/* Agent 2: Risk Arbiter */}
            <div className="p-spacing-sm px-spacing-md rounded-lg bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-spacing-xs">
                <div className="size-2 rounded-full bg-theme-status-warning" />
                <span className="font-bold text-theme-text-primary">
                  {APP_CONTENT.agents.riskArbiter.name}
                </span>
              </div>
              <span className="text-2xs text-theme-text-secondary">
                {APP_CONTENT.agents.riskArbiter.role}
              </span>
            </div>

            {/* Agent 3: Executor */}
            <div className="p-spacing-sm px-spacing-md rounded-lg bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-spacing-xs">
                <div className="size-2 rounded-full bg-theme-status-success" />
                <span className="font-bold text-theme-text-primary">
                  {APP_CONTENT.agents.executor.name}
                </span>
              </div>
              <span className="text-2xs text-theme-text-secondary">
                {APP_CONTENT.agents.executor.role}
              </span>
            </div>
          </div>
        </div>

        {/* Sandboxed Wallet Balances Micro Deck */}
        <div className="mt-spacing-md pt-spacing-sm border-t border-theme-border-subtle">
          <div className="flex items-center justify-between text-2xs mb-spacing-xs font-bold text-theme-text-muted uppercase tracking-wider">
            <div className="flex items-center gap-spacing-xs">
              <Wallet className="size-3.5 text-theme-brand-binance" />
              <span>AGENTIC SANDBOX WALLET</span>
            </div>
            <span className="text-theme-status-success">ISOLATED MPC</span>
          </div>
          <div className="grid grid-cols-2 gap-spacing-xs font-mono text-2xs">
            <div className="p-spacing-xs px-spacing-sm rounded bg-theme-bg-elevated border border-theme-border-subtle flex justify-between">
              <span className="text-theme-text-secondary">USDT:</span>
              <span className="font-bold text-theme-text-primary">$500.00</span>
            </div>
            <div className="p-spacing-xs px-spacing-sm rounded bg-theme-bg-elevated border border-theme-border-subtle flex justify-between">
              <span className="text-theme-text-secondary">USDC:</span>
              <span className="font-bold text-theme-text-primary">$500.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
