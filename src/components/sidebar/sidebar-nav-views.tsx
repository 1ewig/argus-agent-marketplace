'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, Store } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import {
  sidebarHeadingCollapseVariants,
  sidebarHorizontalCollapseVariants,
} from '@/constants/animation';

export interface SidebarNavViewsProps {
  isCollapsed: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * Presentation navigation items for Workspace Views (Trading Desk vs. Agent Marketplace).
 * Automatically tracks route pathname and supports mobile drawer close callbacks.
 */
export const SidebarNavViews = memo(function SidebarNavViews({
  isCollapsed,
  onClick,
}: SidebarNavViewsProps) {
  const pathname = usePathname();
  const isChatActive = pathname === '/' || pathname === '';
  const isMarketplaceActive =
    pathname?.startsWith('/marketplace') || pathname?.startsWith('/agents');

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

      {/* 1. Agent Chat / Trading Desk View Link */}
      <Link
        href="/"
        onClick={onClick}
        title={APP_CONTENT.sidebar.agentView}
        className={`h-10 w-full flex items-center rounded-xl text-xs font-semibold cursor-pointer transition-colors relative overflow-hidden ${
          isChatActive
            ? 'bg-theme-bg-elevated text-theme-text-primary border border-theme-border-subtle shadow-2xs font-bold'
            : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40 border border-transparent'
        }`}
      >
        <div className="size-10 flex items-center justify-center shrink-0">
          <Bot
            className={`size-4 transition-colors ${
              isChatActive ? 'text-theme-brand-binance' : 'text-theme-text-muted'
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
      </Link>

      {/* 2. Agent Marketplace View Link */}
      <Link
        href="/marketplace"
        onClick={onClick}
        title={APP_CONTENT.sidebar.marketplaceView}
        className={`h-10 w-full flex items-center rounded-xl text-xs font-semibold cursor-pointer transition-colors relative overflow-hidden ${
          isMarketplaceActive
            ? 'bg-theme-bg-elevated text-theme-text-primary border border-theme-border-subtle shadow-2xs font-bold'
            : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/40 border border-transparent'
        }`}
      >
        <div className="size-10 flex items-center justify-center shrink-0">
          <Store
            className={`size-4 transition-colors ${
              isMarketplaceActive
                ? 'text-theme-brand-binance'
                : 'text-theme-text-muted'
            }`}
          />
        </div>

        <motion.span
          initial={false}
          variants={sidebarHorizontalCollapseVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
          className="whitespace-nowrap overflow-hidden text-left select-none pr-3"
        >
          {APP_CONTENT.sidebar.marketplaceView}
        </motion.span>
      </Link>
    </div>
  );
});
