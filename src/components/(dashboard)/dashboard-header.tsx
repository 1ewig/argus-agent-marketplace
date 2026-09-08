'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Menu,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';

export interface DashboardHeaderProps {
  isNewChatDisabled: boolean;
  onToggleMobileSidebar?: () => void;
  onNewChat: () => void;
}

/**
 * Pure presentation header for the dashboard stage.
 */
export const DashboardHeader = memo(function DashboardHeader({
  isNewChatDisabled,
  onToggleMobileSidebar,
  onNewChat,
}: DashboardHeaderProps) {
  return (
    <div className="relative z-30 h-14 px-spacing-md sm:px-spacing-lg border-b border-theme-border-subtle bg-theme-bg-base/90 backdrop-blur-xs flex items-center justify-between shrink-0 gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onToggleMobileSidebar}
          title={APP_CONTENT.sidebar.openMobileSidebar}
          aria-label={APP_CONTENT.sidebar.openMobileSidebar}
          className="md:hidden size-8 -ml-1 rounded-lg flex items-center justify-center text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-surface active:bg-theme-bg-elevated border border-transparent hover:border-theme-border-subtle transition-colors cursor-pointer select-none shrink-0"
        >
          <Menu className="size-5 stroke-[2]" />
        </motion.button>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs sm:text-sm font-bold tracking-wider text-theme-text-primary">
            {APP_CONTENT.sidebar.brand}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <motion.button
          type="button"
          whileTap={isNewChatDisabled ? undefined : tapScalePill}
          onClick={onNewChat}
          disabled={isNewChatDisabled}
          title={
            isNewChatDisabled
              ? APP_CONTENT.chat.newSessionDisabled
              : APP_CONTENT.chat.newChatTooltip
          }
          aria-label={APP_CONTENT.chat.newChatButton}
          className={`size-8 sm:h-8 sm:w-auto sm:px-3 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 select-none transition-colors ${
            isNewChatDisabled
              ? 'opacity-40 cursor-not-allowed bg-theme-brand-binance text-theme-bg-overlay'
              : 'bg-theme-brand-binance text-theme-bg-overlay cursor-pointer shadow-2xs hover:brightness-105 active:brightness-95'
          }`}
        >
          <Plus className="size-4 sm:size-3.5 stroke-[2.75]" />
          <span className="hidden sm:inline font-bold">{APP_CONTENT.chat.newChatButton}</span>
        </motion.button>
      </div>
    </div>
  );
});
