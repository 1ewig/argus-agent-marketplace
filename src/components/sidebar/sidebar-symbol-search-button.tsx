'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { sidebarHorizontalCollapseVariants, tapScalePill } from '@/constants/animation';
import { useAppStore } from '@/stores/app-store';

interface SidebarSymbolSearchButtonProps {
  isCollapsed: boolean;
}

export function SidebarSymbolSearchButton({ isCollapsed }: SidebarSymbolSearchButtonProps) {
  const setIsSymbolSearchOpen = useAppStore((state) => state.setIsSymbolSearchOpen);
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);

  // Global hotkey: Cmd+K / Ctrl+K opens the symbol search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSymbolSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSymbolSearchOpen]);

  const cleanBase = selectedSymbol ? selectedSymbol.replace(/USDT$/i, '') : 'BTC';

  return (
    <div className="pb-spacing-sm px-3.5 border-b border-theme-border-subtle shrink-0 flex items-center justify-center">
      <motion.button
        type="button"
        whileTap={tapScalePill}
        onClick={() => setIsSymbolSearchOpen(true)}
        title={`${APP_CONTENT.symbolSearch.buttonLabel} (${APP_CONTENT.symbolSearch.shortcut})`}
        aria-label={APP_CONTENT.symbolSearch.buttonAria}
        className={`h-9 rounded-xl font-medium text-xs flex items-center overflow-hidden select-none transition-colors border border-theme-border-subtle bg-theme-bg-base text-theme-text-primary hover:bg-theme-bg-elevated hover:border-theme-border-strong cursor-pointer ${
          isCollapsed ? 'w-10 justify-center' : 'w-full'
        }`}
      >
        {/* Anchored Icon Slot: exactly 40px wide to guarantee mathematical center when collapsed */}
        <div className="size-10 flex items-center justify-center shrink-0 text-theme-brand-binance">
          <Search className="size-4 stroke-[2.25]" />
        </div>

        {/* Sliding text label and shortcut pill */}
        <motion.div
          initial={false}
          variants={sidebarHorizontalCollapseVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
          className={`flex items-center justify-between min-w-0 flex-1 overflow-hidden select-none ${
            isCollapsed ? 'w-0 opacity-0 p-0 pointer-events-none' : 'pr-2.5'
          }`}
        >
          <span className="truncate text-left text-theme-text-secondary hover:text-theme-text-primary text-xs font-semibold">
            {APP_CONTENT.symbolSearch.buttonLabel}
          </span>

          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <span className="text-2xs font-bold text-theme-brand-binance px-1.5 py-0.5 rounded-md bg-theme-bg-elevated border border-theme-border-subtle tracking-wider">
              {cleanBase}
            </span>
            <kbd className="hidden sm:inline-block text-2xs font-mono text-theme-text-muted bg-theme-bg-surface px-1.5 py-0.5 rounded border border-theme-border-subtle">
              {APP_CONTENT.symbolSearch.shortcut}
            </kbd>
          </div>
        </motion.div>
      </motion.button>
    </div>
  );
}
