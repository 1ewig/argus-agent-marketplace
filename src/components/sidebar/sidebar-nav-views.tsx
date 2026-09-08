'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import {
  sidebarHeadingCollapseVariants,
  sidebarHorizontalCollapseVariants,
  tapScalePill,
} from '@/constants/animation';

export interface SidebarNavViewsProps {
  isCollapsed: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * Presentation navigation item for Agent Workspace.
 * Driven exclusively by props from LeftSidebar.
 */
export const SidebarNavViews = memo(function SidebarNavViews({
  isCollapsed,
  isActive = true,
  onClick,
}: SidebarNavViewsProps) {
  return (
    <div className="py-spacing-sm px-3.5 flex flex-col gap-1 border-b border-theme-border-subtle shrink-0 items-center">
      {/* Section Heading: Collapses height to 0 to prevent awkward whitespace */}
      <motion.div
        initial={false}
        variants={sidebarHeadingCollapseVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        className="overflow-hidden w-full"
      >
        <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted px-2 py-0.5 whitespace-nowrap block">
          {APP_CONTENT.sidebar.viewsTitle}
        </span>
      </motion.div>

      {/* Agent Chat View Button */}
      <motion.button
        type="button"
        whileTap={tapScalePill}
        onClick={onClick}
        title={APP_CONTENT.sidebar.agentView}
        className={`h-10 w-full flex items-center rounded-xl text-xs font-semibold cursor-pointer transition-colors relative overflow-hidden ${
          isActive
            ? 'bg-theme-bg-elevated text-theme-text-primary border border-theme-border-subtle shadow-2xs font-bold'
            : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40 border border-transparent'
        }`}
      >
        <div className="size-10 flex items-center justify-center shrink-0">
          <Bot
            className={`size-4 transition-colors ${
              isActive ? 'text-theme-brand-binance' : 'text-theme-text-muted'
            }`}
          />
        </div>

        <motion.span
          initial={false}
          variants={sidebarHorizontalCollapseVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
          className="whitespace-nowrap overflow-hidden text-left select-none pr-3"
        >
          {APP_CONTENT.sidebar.agentView}
        </motion.span>
      </motion.button>
    </div>
  );
});
