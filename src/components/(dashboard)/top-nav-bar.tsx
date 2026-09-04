'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { StageViewSwitcher } from './stage-view-switcher';

export function TopNavBar() {
  return (
    <header className="relative z-30 h-navbar flex items-center justify-between gap-spacing-md px-spacing-lg bg-theme-bg-surface border-b border-theme-border-subtle shrink-0 w-full">
      {/* Left Area: Monogram & Brand Info */}
      <div className="flex items-center gap-spacing-sm">
        <div className="size-9 rounded-xl bg-theme-bg-overlay text-white flex items-center justify-center font-extrabold text-sm tracking-tighter shadow-sm border border-theme-border-strong shrink-0">
          <span>A<span className="text-theme-brand-binance">.</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-theme-text-primary">
            {APP_CONTENT.header.title}
          </span>
          <span className="text-2xs text-theme-text-muted hidden md:inline">
            {APP_CONTENT.header.subtitle}
          </span>
        </div>
      </div>

      {/* Right Area: Stage Switcher, Search, Notifications, Paper Sandbox Pill */}
      <div className="flex items-center gap-spacing-sm sm:gap-spacing-md">
        {/* Stage View Switcher (Agent vs Chart) */}
        <StageViewSwitcher />
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
          className="relative size-8 rounded-lg flex items-center justify-center bg-theme-bg-elevated hover:bg-theme-bg-surface border border-theme-border-subtle text-theme-text-secondary cursor-pointer transition-colors"
        >
          <Bell className="size-4" />
          <span className="absolute -top-1 -right-1 size-4 rounded-full bg-theme-brand-binance text-theme-bg-overlay text-2xs font-extrabold flex items-center justify-center shadow-2xs">
            {APP_CONTENT.nav.notificationsCount}
          </span>
        </button>

        {/* Paper Sandbox Status Pill */}
        <div className="flex items-center gap-spacing-xs text-2xs font-bold text-theme-brand-binance bg-theme-bg-elevated px-spacing-sm py-1.5 rounded-lg border border-theme-border-subtle shadow-2xs">
          <span className="size-1.5 rounded-full bg-theme-brand-binance animate-pulse" />
          <span>{APP_CONTENT.modes.simulation.label}</span>
        </div>
      </div>
    </header>
  );
}
