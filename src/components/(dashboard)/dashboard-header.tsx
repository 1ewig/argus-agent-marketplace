'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  Plus,
  Globe,
  PanelRightClose,
  PanelRightOpen,
  LineChart,
  Bot,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import type { StageViewMode } from '@/lib/types';

export interface DashboardHeaderProps {
  symbol: string;
  isGlobal: boolean;
  stageView: StageViewMode;
  isNewChatDisabled: boolean;
  isMarketPanelOpen: boolean;
  onOpenSymbolSearch: () => void;
  onToggleStageView: () => void;
  onNewChat: () => void;
  onToggleMarketPanel: () => void;
}

/**
 * Pure presentation header for the dashboard stage.
 * Receives all symbol state, stage view, panel status, and action callbacks from DashboardClient.
 */
export const DashboardHeader = memo(function DashboardHeader({
  symbol,
  isGlobal,
  stageView,
  isNewChatDisabled,
  isMarketPanelOpen,
  onOpenSymbolSearch,
  onToggleStageView,
  onNewChat,
  onToggleMarketPanel,
}: DashboardHeaderProps) {
  return (
    <div className="relative z-30 h-14 px-spacing-md sm:px-spacing-lg border-b border-theme-border-subtle bg-theme-bg-base/90 backdrop-blur-xs flex items-center justify-between shrink-0">
      {/* Left Header Section: Symbol / Workspace Dropdown + Switch to Charts Toggle */}
      <div className="flex items-center gap-2">
        {/* Minimal Symbol / Workspace Dropdown Button with Tactile Press */}
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onOpenSymbolSearch}
          title={APP_CONTENT.chat.switchSymbolTooltip}
          className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 -ml-2 rounded-lg text-theme-text-primary hover:bg-theme-bg-surface active:bg-theme-bg-elevated border border-transparent hover:border-theme-border-subtle transition-colors cursor-pointer select-none"
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

        {/* Stage View Switcher Button (Right side of the symbol) */}
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onToggleStageView}
          title={
            stageView === 'agent'
              ? APP_CONTENT.chart.switchToChart
              : APP_CONTENT.chart.switchToAgent
          }
          aria-label={APP_CONTENT.chart.stageSwitchAria}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer select-none transition-colors border ${
            stageView === 'chart'
              ? 'bg-theme-bg-elevated text-theme-brand-binance border-theme-border-subtle shadow-2xs font-bold'
              : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-surface border-theme-border-subtle/50'
          }`}
        >
          {stageView === 'agent' ? (
            <>
              <LineChart className="size-3.5 text-theme-brand-binance shrink-0" />
              <span className="hidden sm:inline font-mono">{APP_CONTENT.sidebar.chartView}</span>
            </>
          ) : (
            <>
              <Bot className="size-3.5 text-theme-brand-binance shrink-0" />
              <span className="hidden sm:inline font-mono">{APP_CONTENT.sidebar.agentView}</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Right Header Section: New Chat Button, Market Panel Toggle */}
      <div className="flex items-center gap-2">
        {/* New Chat Primary Action Button */}
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
          className={`h-8 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 select-none transition-colors ${
            isNewChatDisabled
              ? 'opacity-40 cursor-not-allowed bg-theme-brand-binance text-theme-bg-overlay'
              : 'bg-theme-brand-binance text-theme-bg-overlay cursor-pointer shadow-2xs hover:brightness-105 active:brightness-95'
          }`}
        >
          <Plus className="size-3.5 stroke-[2.75]" />
          <span className="font-bold">{APP_CONTENT.chat.newChatButton}</span>
        </motion.button>

        {/* Collapsible Market Panel Toggle Button */}
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
