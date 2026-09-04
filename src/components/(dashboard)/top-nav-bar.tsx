'use client';

import React from 'react';
import { Search, Bell, Sparkles } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { ExecutionMode } from '@/lib/types';

interface TopNavBarProps {
  executionMode: ExecutionMode;
  onModeChange: (mode: ExecutionMode) => void;
}

export function TopNavBar({ executionMode, onModeChange }: TopNavBarProps) {
  return (
    <header className="flex items-center justify-between gap-spacing-md px-spacing-lg py-spacing-sm bg-theme-bg-surface border-b border-theme-border-subtle shrink-0">
      {/* Left Area: Title & Brand Info */}
      <div className="flex items-center gap-spacing-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-theme-text-primary">
          {APP_CONTENT.header.title}
        </span>
        <span className="text-2xs text-theme-text-muted hidden md:inline">
          {APP_CONTENT.header.subtitle}
        </span>
      </div>

      {/* Right Area: Search, Notifications, Mode Switcher, Status Pill */}
      <div className="flex items-center gap-spacing-sm sm:gap-spacing-md">
        {/* Quick Search Bar */}
        <div className="hidden lg:flex items-center gap-spacing-xs bg-theme-bg-elevated px-spacing-sm py-1.5 rounded-lg border border-theme-border-subtle text-theme-text-muted text-xs">
          <Search className="size-3.5" />
          <span className="text-theme-text-muted text-2xs">{APP_CONTENT.nav.searchPlaceholder}</span>
          <kbd className="text-2xs px-1 py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle text-theme-text-muted font-mono ml-spacing-sm">
            ⌘K
          </kbd>
        </div>

        {/* Notifications Button with Counter Badge */}
        <button
          type="button"
          title={APP_CONTENT.nav.notificationsTitle}
          aria-label={APP_CONTENT.nav.notificationsTitle}
          className="relative size-8 rounded-lg flex items-center justify-center bg-theme-bg-elevated hover:bg-theme-bg-base border border-theme-border-subtle text-theme-text-secondary cursor-pointer transition-colors"
        >
          <Bell className="size-4" />
          <span className="absolute -top-1 -right-1 size-4 rounded-full bg-theme-brand-binance text-theme-bg-overlay text-2xs font-extrabold flex items-center justify-center shadow-2xs">
            {APP_CONTENT.nav.notificationsCount}
          </span>
        </button>

        {/* Mode Selector (Sandbox vs Live MCP) */}
        <div className="flex items-center bg-theme-bg-elevated p-0.5 rounded-lg border border-theme-border-subtle">
          <button
            type="button"
            onClick={() => onModeChange('simulation')}
            className={`text-2xs font-bold px-spacing-sm py-1 rounded-md transition-all cursor-pointer ${
              executionMode === 'simulation'
                ? 'bg-theme-bg-surface text-theme-brand-binance shadow-2xs border border-theme-border-subtle font-extrabold'
                : 'text-theme-text-secondary hover:text-theme-text-primary'
            }`}
          >
            {APP_CONTENT.modes.simulation.label}
          </button>
          <button
            type="button"
            onClick={() => onModeChange('live_mcp')}
            className={`text-2xs font-bold px-spacing-sm py-1 rounded-md transition-all cursor-pointer ${
              executionMode === 'live_mcp'
                ? 'bg-theme-bg-overlay text-theme-brand-binance shadow-2xs font-extrabold'
                : 'text-theme-text-secondary hover:text-theme-text-primary'
            }`}
          >
            {APP_CONTENT.modes.liveMcp.label}
          </button>
        </div>

        {/* Live Feeds Status Indicator */}
        <div className="flex items-center gap-spacing-xs text-2xs font-mono text-theme-text-secondary bg-theme-bg-elevated px-spacing-sm py-1 rounded-md border border-theme-border-subtle">
          <span className="size-1.5 rounded-full bg-theme-status-success animate-pulse" />
          <span className="hidden sm:inline font-medium">{APP_CONTENT.nav.statusOnline}</span>
        </div>

        {/* Agent Avatar Pill */}
        <div
          title={APP_CONTENT.header.title}
          className="size-8 rounded-full bg-theme-bg-overlay flex items-center justify-center text-theme-brand-binance border border-theme-border-strong cursor-pointer shrink-0"
        >
          <Sparkles className="size-4" />
        </div>
      </div>
    </header>
  );
}
