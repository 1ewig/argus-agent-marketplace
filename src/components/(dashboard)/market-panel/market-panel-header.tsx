'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Globe, Loader2, Bot, Activity, RefreshCw, Clock, X } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import type { RightPanelTab } from '@/lib/types';
import type { StreamConnectionStatus } from '@/lib/binance-websocket';

export interface MarketPanelHeaderProps {
  isMobile?: boolean;
  isGlobal: boolean;
  rightPanelTab: RightPanelTab;
  isIntelligenceActive: boolean;
  spotStatus?: StreamConnectionStatus;
  onTabSelect: (tab: RightPanelTab) => void;
  onTogglePanel: () => void;
  isGlobalFetching?: boolean;
  onRefreshGlobal?: () => void;
  isAnalyzing?: boolean;
  isAnalysisFresh?: boolean;
  nextRunCountdown?: string | null;
  onScanIntelligence?: () => void;
}

/**
 * Pure presentation header for MarketPanel.
 * Adapts seamlessly across desktop (labeled tabs) and mobile (mere icons + close button).
 */
export const MarketPanelHeader = memo(function MarketPanelHeader({
  isMobile = false,
  isGlobal,
  rightPanelTab,
  isIntelligenceActive,
  spotStatus = 'idle',
  onTabSelect,
  onTogglePanel,
  isGlobalFetching = false,
  onRefreshGlobal,
  isAnalyzing = false,
  isAnalysisFresh = false,
  nextRunCountdown,
  onScanIntelligence,
}: MarketPanelHeaderProps) {
  const content = APP_CONTENT.marketPanel;
  const globalContent = APP_CONTENT.globalMarket;
  const intelligence = APP_CONTENT.marketIntelligence;

  if (isGlobal) {
    return (
      <div className="h-14 px-3.5 sm:px-4 flex items-center justify-between border-b border-theme-border-subtle shrink-0 gap-2 bg-theme-bg-surface">
        {/* Workspace Title & Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-theme-bg-elevated/70 border border-theme-border-subtle/80">
            <Globe className="size-3.5 text-theme-brand-binance shrink-0" />
            <span className="text-xs font-bold text-theme-text-primary truncate">
              {globalContent.headerTitle}
            </span>
            <span className="text-2xs font-mono font-bold text-theme-brand-binance bg-theme-brand-binance/10 border border-theme-brand-binance/25 px-1.5 py-0.5 rounded shrink-0">
              {globalContent.headerBadge}
            </span>
          </div>
        </div>

        {/* Global Action & Close Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <motion.button
            type="button"
            whileTap={isGlobalFetching ? undefined : tapScalePill}
            onClick={onRefreshGlobal}
            disabled={isGlobalFetching}
            aria-label={isGlobalFetching ? globalContent.refreshing : globalContent.refreshButton}
            title={globalContent.refreshButton}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-bold bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 active:bg-theme-bg-surface border border-theme-border-subtle text-theme-text-primary transition-colors cursor-pointer disabled:opacity-50 shadow-2xs ${
              isMobile ? 'size-8 p-0' : 'px-2.5 py-1'
            }`}
          >
            <RefreshCw className={`size-3 text-theme-brand-binance ${isGlobalFetching ? 'animate-spin' : ''}`} />
            {!isMobile && (
              <span>{isGlobalFetching ? globalContent.refreshing : globalContent.refreshButton}</span>
            )}
          </motion.button>

          {isMobile && (
            <motion.button
              type="button"
              whileTap={tapScalePill}
              onClick={onTogglePanel}
              aria-label={content.collapsePanel}
              title={content.collapsePanel}
              className="size-8 rounded-lg flex items-center justify-center text-theme-text-primary bg-theme-bg-elevated active:bg-theme-bg-surface border border-theme-border-subtle transition-colors cursor-pointer shrink-0"
            >
              <X className="size-4" />
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-14 px-3.5 sm:px-4 flex items-center justify-between border-b border-theme-border-subtle shrink-0 gap-2 bg-theme-bg-surface">
      {/* Segmented Control: Mere icons on mobile, labeled tabs on desktop */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-theme-bg-elevated/70 border border-theme-border-subtle/80 shrink-0">
        {/* Tab 1: Live Telemetry */}
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={() => onTabSelect('overview')}
          title={content.tabs.overview}
          aria-label={content.tabs.overview}
          className={`flex items-center justify-center gap-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
            isMobile ? 'size-8' : 'px-2.5 py-1'
          } ${
            rightPanelTab === 'overview'
              ? 'bg-theme-bg-surface text-theme-text-primary shadow-2xs'
              : 'text-theme-text-secondary hover:text-theme-text-primary'
          }`}
        >
          <Activity className="size-3.5 text-theme-brand-binance shrink-0" />
          {!isMobile && <span>{content.tabs.overview}</span>}
        </motion.button>

        {/* Tab 2: Market Intelligence */}
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={() => onTabSelect('intelligence')}
          title={content.tabs.intelligence}
          aria-label={content.tabs.intelligence}
          className={`flex items-center justify-center gap-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
            isMobile ? 'size-8' : 'px-2.5 py-1'
          } ${
            isIntelligenceActive
              ? 'bg-theme-bg-surface text-theme-text-primary shadow-2xs'
              : 'text-theme-text-secondary hover:text-theme-text-primary'
          }`}
        >
          <Bot className="size-3.5 text-theme-brand-binance shrink-0" />
          {!isMobile && <span>{content.tabs.intelligence}</span>}
        </motion.button>
      </div>

      {/* Right Slot: Live Stream / Intelligence Status & Actions & Mobile Close Button */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Connection status for Telemetry view */}
        {rightPanelTab === 'overview' && spotStatus !== 'connected' && (
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors shrink-0 ${
              spotStatus === 'connecting' || spotStatus === 'reconnecting'
                ? 'bg-theme-brand-binance/10 border-theme-brand-binance/30 text-theme-brand-binance'
                : 'bg-theme-status-danger/10 border-theme-status-danger/30 text-theme-status-danger'
            }`}
          >
            {spotStatus === 'connecting' || spotStatus === 'reconnecting' ? (
              <Loader2 className="size-2.5 animate-spin" />
            ) : (
              <span className="size-1.5 rounded-full bg-theme-status-danger" />
            )}
            <span className="text-[10px] font-mono font-bold tracking-tight">
              {spotStatus === 'connecting'
                ? content.statusConnecting
                : spotStatus === 'reconnecting'
                ? content.statusReconnecting
                : content.statusError}
            </span>
          </div>
        )}

        {/* Status and Scan Trigger for Intelligence view */}
        {isIntelligenceActive && (
          <div className="flex items-center gap-1.5 shrink-0">
            {isAnalyzing ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-theme-bg-elevated text-theme-text-secondary border border-theme-border-subtle shadow-2xs">
                <RefreshCw className="size-3 text-theme-brand-binance animate-spin shrink-0" />
                {!isMobile && <span>{intelligence.refreshing}</span>}
              </div>
            ) : isAnalysisFresh && nextRunCountdown ? (
              <div
                title={intelligence.nextRunTooltip}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono font-bold bg-theme-bg-elevated/80 border border-theme-border-subtle text-theme-text-secondary select-none shadow-2xs"
              >
                <Clock className="size-3 text-theme-brand-binance shrink-0" />
                {!isMobile && (
                  <span className="text-theme-text-muted text-[11px] font-sans font-semibold uppercase tracking-wider">
                    {intelligence.nextRunPrefix}
                  </span>
                )}
                <span className="text-theme-text-primary">{nextRunCountdown}</span>
              </div>
            ) : (
              <motion.button
                type="button"
                whileTap={tapScalePill}
                onClick={onScanIntelligence}
                disabled={isAnalyzing}
                aria-label={intelligence.refreshButton}
                title={intelligence.refreshButton}
                className={`inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-bold bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 active:bg-theme-bg-surface border border-theme-border-subtle text-theme-text-primary transition-colors cursor-pointer disabled:opacity-50 shadow-2xs ${
                  isMobile ? 'size-8 p-0' : 'px-2.5 py-1'
                }`}
              >
                <RefreshCw className={`size-3 text-theme-brand-binance ${isAnalyzing ? 'animate-spin' : ''}`} />
                {!isMobile && <span>{intelligence.refreshButton}</span>}
              </motion.button>
            )}
          </div>
        )}

        {/* Mobile Close Button */}
        {isMobile && (
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={onTogglePanel}
            aria-label={content.collapsePanel}
            title={content.collapsePanel}
            className="size-8 rounded-lg flex items-center justify-center text-theme-text-primary bg-theme-bg-elevated active:bg-theme-bg-surface border border-theme-border-subtle transition-colors cursor-pointer shrink-0"
          >
            <X className="size-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
});
