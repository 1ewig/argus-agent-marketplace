'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  Plus,
  Globe,
  PanelRightClose,
  PanelRightOpen,
  Menu,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';

export interface DashboardHeaderProps {
  symbol: string;
  isGlobal: boolean;
  isNewChatDisabled: boolean;
  isMarketPanelOpen: boolean;
  onToggleMobileSidebar?: () => void;
  onOpenSymbolSearch: () => void;
  onNewChat: () => void;
  onToggleMarketPanel: () => void;
}

/**
 * Pure presentation header for the dashboard stage.
 * Receives symbol state, panel status, and action callbacks.
 */
export const DashboardHeader = memo(function DashboardHeader({
  symbol,
  isGlobal,
  isNewChatDisabled,
  isMarketPanelOpen,
  onToggleMobileSidebar,
  onOpenSymbolSearch,
  onNewChat,
  onToggleMarketPanel,
}: DashboardHeaderProps) {
  return (
    <div className="relative z-30 h-14 px-spacing-md sm:px-spacing-lg border-b border-theme-border-subtle bg-theme-bg-base/90 backdrop-blur-xs flex items-center justify-between shrink-0 gap-3">
      {/* Left Header Section: Mobile Menu Trigger + Symbol Dropdown */}
      <div className="flex items-center gap-2 min-w-0">
        {/* 3-Line Hamburger Menu Trigger (Mobile only) */}
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
          {/* Minimal Symbol / Workspace Dropdown Button with Tactile Press */}
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={onOpenSymbolSearch}
            title={APP_CONTENT.chat.switchSymbolTooltip}
            className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 -ml-2 rounded-lg text-theme-text-primary hover:bg-theme-bg-surface active:bg-theme-bg-elevated border border-transparent hover:border-theme-border-subtle transition-colors cursor-pointer select-none shrink-0"
          >
            {isGlobal ? (
              <>
                <Globe className="size-3.5 text-theme-brand-binance shrink-0" />
                <span className="text-xs sm:text-sm font-bold tracking-wider">
                  {APP_CONTENT.chat.globalWorkspaceTitle}
                </span>
              </>
            ) : (
              <span className="text-xs sm:text-sm font-bold tracking-wider">
                {symbol}
              </span>
            )}
            <ChevronDown className="size-3.5 text-theme-text-muted group-hover:text-theme-text-primary transition-colors" />
          </motion.button>
        </div>
      </div>

      {/* Right Header Section: New Chat + Market Panel Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {/* New Chat Primary Action Button (Compact '+' icon on mobile, full pill on desktop) */}
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

        {/* Collapsible Market Panel Toggle Button (Visible on both desktop & mobile) */}
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onToggleMarketPanel}
          title={
            isMarketPanelOpen
              ? APP_CONTENT.marketPanel.collapsePanel
              : APP_CONTENT.marketPanel.expandPanel
          }
          aria-label={
            isMarketPanelOpen
              ? APP_CONTENT.marketPanel.collapsePanel
              : APP_CONTENT.marketPanel.expandPanel
          }
          className={`size-8 rounded-lg flex items-center justify-center select-none cursor-pointer transition-colors border ${
            isMarketPanelOpen
              ? 'bg-theme-bg-elevated text-theme-brand-binance border-theme-border-subtle shadow-2xs'
              : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-surface border-transparent hover:border-theme-border-subtle'
          }`}
        >
          {isMarketPanelOpen ? (
            <PanelRightClose className="size-4" />
          ) : (
            <PanelRightOpen className="size-4" />
          )}
        </motion.button>
      </div>
    </div>
  );
});