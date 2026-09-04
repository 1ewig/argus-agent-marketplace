'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { sidebarSpringTransition, tapScaleIcon } from '@/constants/animation';

interface SidebarThemeToggleProps {
  isCollapsed: boolean;
  isDark: boolean;
  onToggle: () => void;
}

export function SidebarThemeToggle({
  isCollapsed,
  isDark,
  onToggle,
}: SidebarThemeToggleProps) {
  return (
    <div className="py-spacing-sm px-3.5 flex flex-col border-t border-theme-border-subtle bg-theme-bg-surface shrink-0 items-center">
      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        whileTap={tapScaleIcon}
        onClick={onToggle}
        title={isDark ? APP_CONTENT.sidebar.themeLight : APP_CONTENT.sidebar.themeDark}
        aria-label={isDark ? APP_CONTENT.sidebar.themeLight : APP_CONTENT.sidebar.themeDark}
        className={`h-10 flex items-center rounded-xl bg-theme-bg-elevated hover:bg-theme-bg-surface active:bg-theme-bg-elevated border border-theme-border-subtle hover:border-theme-border-strong text-theme-text-secondary hover:text-theme-text-primary text-xs font-semibold cursor-pointer transition-colors shadow-2xs overflow-hidden ${
          isCollapsed ? 'w-10 justify-center' : 'w-full'
        }`}
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
          animate={{
            opacity: isCollapsed ? 0 : 1,
            width: isCollapsed ? 0 : 'auto',
          }}
          transition={sidebarSpringTransition}
          className={`flex-1 flex items-center justify-between min-w-0 overflow-hidden whitespace-nowrap ${
            isCollapsed ? 'w-0 opacity-0 p-0 pointer-events-none' : 'pr-2.5'
          }`}
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
}
