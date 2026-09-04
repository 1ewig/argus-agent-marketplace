'use client';

import React from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_CONTENT } from '@/constants/content';
import { tapScaleIcon } from '@/constants/animation';
import { useTheme } from '@/hooks';
import { ArgusIcon } from './argus-icon';
import { StageViewSwitcher } from './stage-view-switcher';

export function TopNavBar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="relative z-30 h-navbar flex items-center justify-between gap-spacing-md px-spacing-lg bg-theme-bg-surface border-b border-theme-border-subtle shrink-0 w-full">
      {/* Left Area: Brand Icon, Title, and Theme Switcher */}
      <div className="flex items-center gap-spacing-sm">
        <ArgusIcon className="size-6 text-theme-brand-binance shrink-0" />
        <h1 className="text-base font-extrabold tracking-tight text-theme-text-primary">
          {APP_CONTENT.header.title}
        </h1>

        {/* Theme Toggle Button placed at the end of Argus title */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={tapScaleIcon}
          onClick={toggleTheme}
          title={isDark ? APP_CONTENT.nav.themeToggleDark : APP_CONTENT.nav.themeToggleLight}
          aria-label={isDark ? APP_CONTENT.nav.themeToggleDark : APP_CONTENT.nav.themeToggleLight}
          className="size-7 rounded-lg flex items-center justify-center bg-theme-bg-elevated hover:bg-theme-bg-surface active:bg-theme-bg-surface border border-theme-border-subtle hover:border-theme-border-strong text-theme-text-secondary hover:text-theme-text-primary cursor-pointer transition-colors ml-0.5 select-none shadow-2xs"
        >
          {isDark ? (
            <Sun className="size-3.5 text-theme-brand-accent transition-transform duration-200" />
          ) : (
            <Moon className="size-3.5 text-theme-text-secondary transition-transform duration-200" />
          )}
        </motion.button>
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
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={tapScaleIcon}
          title={APP_CONTENT.nav.notificationsTitle}
          aria-label={APP_CONTENT.nav.notificationsTitle}
          className="relative size-8 rounded-lg flex items-center justify-center bg-theme-bg-elevated hover:bg-theme-bg-surface active:bg-theme-bg-surface border border-theme-border-subtle hover:border-theme-border-strong text-theme-text-secondary cursor-pointer transition-colors select-none shadow-2xs"
        >
          <Bell className="size-4" />
          <span className="absolute -top-1 -right-1 size-4 rounded-full bg-theme-brand-binance text-theme-bg-overlay text-2xs font-extrabold flex items-center justify-center shadow-2xs">
            {APP_CONTENT.nav.notificationsCount}
          </span>
        </motion.button>

        {/* Paper Sandbox Status Pill */}
        <div className="flex items-center gap-spacing-xs text-2xs font-bold text-theme-brand-binance bg-theme-bg-elevated px-spacing-sm py-1.5 rounded-lg border border-theme-border-subtle shadow-2xs">
          <span className="size-1.5 rounded-full bg-theme-brand-binance animate-pulse" />
          <span>{APP_CONTENT.modes.simulation.label}</span>
        </div>
      </div>
    </header>
  );
}
