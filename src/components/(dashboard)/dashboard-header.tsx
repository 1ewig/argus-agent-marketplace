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
import type { LiveTickerData } from '@/lib/binance-websocket';

export interface DashboardHeaderProps {
  symbol: string;
  isGlobal: boolean;
  stageView: StageViewMode;
  chartTimeframe?: string;
  ticker?: LiveTickerData | null;
  isNewChatDisabled: boolean;
  isMarketPanelOpen: boolean;
  onOpenSymbolSearch: () => void;
  onToggleStageView: () => void;
  onSelectChartTimeframe?: (tfId: string) => void;
  onNewChat: () => void;
  onToggleMarketPanel: () => void;
}

/**
 * Pure presentation header for the dashboard stage.
 * Receives all symbol state, stage view, live ticker, timeframe, panel status, and action callbacks.
 */
export const DashboardHeader = memo(function DashboardHeader({
  symbol,
  isGlobal,
  stageView,
  chartTimeframe = '1D',
  ticker,
  isNewChatDisabled,
  isMarketPanelOpen,
  onOpenSymbolSearch,
  onToggleStageView,
  onSelectChartTimeframe,
  onNewChat,
  onToggleMarketPanel,
}: DashboardHeaderProps) {
  const timeframes = APP_CONTENT.chart.timeframes;

  return (
    <div className="relative z-30 h-14 px-spacing-md sm:px-spacing-lg border-b border-theme-border-subtle bg-theme-bg-base/90 backdrop-blur-xs flex items-center justify-between shrink-0 gap-3">
      {/* Left Header Section: Symbol Dropdown + Live Price + 24h Stats + Timeframe Switchers */}
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

        {/* Live Flash Price Badge & 24h Stats (Active when Trading Chart is open) */}
        {stageView === 'chart' && ticker && (
          <div className="flex items-center gap-2.5 shrink-0 animate-in fade-in duration-200">
            {/* Live Flash Price Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-mono font-bold transition-all duration-300 ${
                ticker.flashDirection === 'up'
                  ? 'bg-theme-positive-base/20 text-theme-positive-base ring-1 ring-theme-positive-base/40'
                  : ticker.flashDirection === 'down'
                  ? 'bg-theme-negative-base/20 text-theme-negative-base ring-1 ring-theme-negative-base/40'
                  : ticker.changeAmount >= 0
                  ? 'text-theme-positive-base'
                  : 'text-theme-negative-base'
              }`}
            >
              <span>{ticker.price.toFixed(ticker.precision)}</span>
              <span className="text-2xs">{ticker.changeAmount >= 0 ? '▲' : '▼'}</span>
            </div>

            {/* 24h Stats */}
            <div className="hidden xl:flex items-center gap-3 text-xs font-mono border-l border-theme-border-subtle pl-2.5">
              <div className="flex flex-col">
                <span className="text-2xs text-theme-text-muted uppercase font-sans">
                  {APP_CONTENT.chart.stats.change24h}
                </span>
                <span
                  className={`font-semibold text-2xs ${
                    ticker.changeAmount >= 0
                      ? 'text-theme-positive-base'
                      : 'text-theme-negative-base'
                  }`}
                >
                  {ticker.changeAmount >= 0 ? '+' : ''}
                  {ticker.changeAmount.toFixed(ticker.precision)} (
                  {ticker.changeAmount >= 0 ? '+' : ''}
                  {ticker.changePercent.toFixed(2)}%)
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-2xs text-theme-text-muted uppercase font-sans">
                  {APP_CONTENT.chart.stats.high24h}
                </span>
                <span className="text-theme-text-primary font-medium text-2xs">
                  {ticker.high24h.toFixed(ticker.precision)}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-2xs text-theme-text-muted uppercase font-sans">
                  {APP_CONTENT.chart.stats.low24h}
                </span>
                <span className="text-theme-text-primary font-medium text-2xs">
                  {ticker.low24h.toFixed(ticker.precision)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Price Timeframe Switchers (Active when Trading Chart is open) */}
        {stageView === 'chart' && onSelectChartTimeframe && (
          <div className="flex items-center gap-1 bg-theme-bg-elevated p-0.5 rounded-lg border border-theme-border-subtle shrink-0 animate-in fade-in duration-200">
            {timeframes.map((tf) => {
              const isActive = tf.id === chartTimeframe;
              return (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => onSelectChartTimeframe(tf.id)}
                  className={`px-2.5 py-1 text-2xs font-semibold rounded-md transition-colors cursor-pointer select-none ${
                    isActive
                      ? 'bg-theme-brand-binance text-theme-bg-overlay shadow-2xs font-bold'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-surface/80'
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Header Section: Agent/Chart Switcher (in front of New Chat) + New Chat + Market Panel Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Stage View Switcher Button (Directly in front of New Chat) */}
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
          className={`h-8 px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer select-none transition-colors border ${
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
