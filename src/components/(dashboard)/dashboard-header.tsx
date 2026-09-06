'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Plus, Globe, PanelRightClose, PanelRightOpen, Bot } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import { isGlobalSymbol } from '@/lib/utils';
import { useChatSessions } from '@/hooks';
import { useAppStore, isIntelligenceTabActive } from '@/stores/app-store';

export function DashboardHeader() {
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const setIsSymbolSearchOpen = useAppStore((state) => state.setIsSymbolSearchOpen);
  const isMarketPanelOpen = useAppStore((state) => state.isMarketPanelOpen);
  const setIsMarketPanelOpen = useAppStore((state) => state.setIsMarketPanelOpen);
  const toggleMarketPanel = useAppStore((state) => state.toggleMarketPanel);
  const rightPanelTab = useAppStore((state) => state.rightPanelTab);
  const setRightPanelTab = useAppStore((state) => state.setRightPanelTab);
  const { handleNewSession, isNewChatDisabled } = useChatSessions();

  const isGlobalWorkspace = isGlobalSymbol(selectedSymbol);
  const cleanSymbol = (selectedSymbol || 'BTCUSDT').toUpperCase();

  return (
    <div className="relative z-30 h-14 px-spacing-md sm:px-spacing-lg border-b border-theme-border-subtle bg-theme-bg-base/90 backdrop-blur-xs flex items-center justify-between shrink-0">
      <div className="flex items-center">
        {/* Minimal Symbol / Workspace Dropdown Button with Tactile Press */}
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={() => setIsSymbolSearchOpen(true)}
          title={APP_CONTENT.chat.switchSymbolTooltip}
          className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 -ml-2 rounded-lg text-theme-text-primary hover:bg-theme-bg-surface active:bg-theme-bg-elevated border border-transparent hover:border-theme-border-subtle transition-colors cursor-pointer select-none"
        >
          {isGlobalWorkspace ? (
            <>
              <Globe className="size-3.5 text-theme-brand-binance shrink-0" />
              <span className="text-xs sm:text-sm font-bold tracking-wider">
                {APP_CONTENT.chat.globalWorkspaceTitle}
              </span>
            </>
          ) : (
            <span className="text-xs sm:text-sm font-bold tracking-wider">
              {cleanSymbol}
            </span>
          )}
          <ChevronDown className="size-3.5 text-theme-text-muted group-hover:text-theme-text-primary transition-colors" />
        </motion.button>
      </div>

      {/* Right Header Section: New Chat Button, Sub-Agents Toggle, Market Panel Toggle */}
      <div className="flex items-center gap-2">
        {/* New Chat Primary Action Button */}
        <motion.button
          type="button"
          whileTap={isNewChatDisabled ? undefined : tapScalePill}
          onClick={() => handleNewSession()}
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

        {/* Dedicated Market Intelligence Agent Trigger Button */}
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={() => {
            if (!isMarketPanelOpen) {
              setIsMarketPanelOpen(true);
              setRightPanelTab('intelligence');
            } else if (isIntelligenceTabActive(rightPanelTab)) {
              setRightPanelTab('overview');
            } else {
              setRightPanelTab('intelligence');
            }
          }}
          title={APP_CONTENT.marketIntelligence.headerButtonTooltip}
          aria-label={APP_CONTENT.marketIntelligence.headerButtonLabel}
          className={`h-8 px-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 select-none transition-colors border cursor-pointer ${
            isMarketPanelOpen && isIntelligenceTabActive(rightPanelTab)
              ? 'bg-theme-bg-elevated text-theme-brand-binance border-theme-brand-binance/40 shadow-2xs'
              : 'bg-theme-bg-surface text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated border-theme-border-subtle'
          }`}
        >
          <Bot className="size-3.5 text-theme-brand-binance" />
          <span className="font-semibold">{APP_CONTENT.marketIntelligence.headerButtonLabel}</span>
        </motion.button>

        {/* Collapsible Market Panel Toggle Button */}
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={toggleMarketPanel}
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
}
