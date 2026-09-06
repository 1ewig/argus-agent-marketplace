'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { sidebarHorizontalCollapseVariants, tapScalePill } from '@/constants/animation';

export interface SidebarThemeToggleProps {
  isCollapsed: boolean;
  isDark: boolean;
  onToggle: () => void;
}

/**
 * Pure presentation button to toggle color mode theme between light and dark.
 * Driven exclusively by props from LeftSidebar.
 */
export const SidebarThemeToggle = memo(function SidebarThemeToggle({
  isCollapsed,
  isDark,
  onToggle,
}: SidebarThemeToggleProps) {
  return (
    <div className="py-spacing-sm px-3.5 flex flex-col border-t border-theme-border-subtle bg-theme-bg-surface shrink-0 items-center">
      <motion.button
        type="button"
        whileTap={tapScalePill}
        onClick={onToggle}
        title={isDark ? APP_CONTENT.sidebar.themeLight : APP_CONTENT.sidebar.themeDark}
        aria-label={isDark ? APP_CONTENT.sidebar.themeLight : APP_CONTENT.sidebar.themeDark}
        className="h-10 w-full flex items-center rounded-xl bg-theme-bg-elevated hover:bg-theme-bg-surface active:bg-theme-bg-elevated border border-theme-border-subtle hover:border-theme-border-strong text-theme-text-secondary hover:text-theme-text-primary text-xs font-semibold cursor-pointer transition-colors shadow-2xs overflow-hidden"
      >
        {/* Anchored Theme Icon Slot */}
        <div className="size-10 flex items-center justify-center shrink-0">
          {isDark ? (
            <Sun className="size-4 text-theme-brand-binance" />
          ) : (
            <Moon className="size-4 text-theme-text-primary" />
          )}
        </div>

        {/* Label and Badge Container */}
        <motion.div
          initial={false}
          variants={sidebarHorizontalCollapseVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
          className="flex-1 flex items-center justify-between min-w-0 overflow-hidden whitespace-nowrap pr-2.5"
        >
          <span className="text-left font-medium">
            {isDark ? APP_CONTENT.sidebar.themeLight : APP_CONTENT.sidebar.themeDark}
          </span>

          <kbd className="text-2xs px-1.5 py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle text-theme-text-muted font-mono font-bold tracking-wider">
            {isDark ? APP_CONTENT.sidebar.themeLightBadge : APP_CONTENT.sidebar.themeDarkBadge}
          </kbd>
        </motion.div>
      </motion.button>
    </div>
  );
});
