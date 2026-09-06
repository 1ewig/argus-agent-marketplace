'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { APP_CONTENT, type ChartTimeframeOption } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';

export interface ChartTickerStats {
  priceChange: number;
  priceChangePercent: number;
  high: number;
  low: number;
  close: number;
}

export interface ChartHeaderProps {
  symbol: string;
  livePrice: number | null;
  flashDirection: 'up' | 'down' | null;
  tickerStats: ChartTickerStats | null;
  activeTimeframe: string;
  timeframes: readonly ChartTimeframeOption[];
  wsStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  isFullscreen: boolean;
  precision?: number;
  onTimeframeSelect: (tfId: string) => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
}

export const ChartHeader = memo(function ChartHeader({
  livePrice,
  flashDirection,
  tickerStats,
  activeTimeframe,
  timeframes,
  wsStatus,
  isFullscreen,
  precision = 2,
  onTimeframeSelect,
  onResetZoom,
  onToggleFullscreen,
}: ChartHeaderProps) {
  const chartContent = APP_CONTENT.chart;

  // Flash price classes
  const isUp = flashDirection === 'up' || (tickerStats && tickerStats.priceChange >= 0);
  const flashBgClass =
    flashDirection === 'up'
      ? 'bg-theme-positive-base/20 text-theme-positive-base ring-1 ring-theme-positive-base/40'
      : flashDirection === 'down'
      ? 'bg-theme-negative-base/20 text-theme-negative-base ring-1 ring-theme-negative-base/40'
      : isUp
      ? 'text-theme-positive-base'
      : 'text-theme-negative-base';

  return (
    <div className="h-12 px-3 sm:px-4 border-b border-theme-border-subtle bg-theme-bg-surface/60 backdrop-blur-xs flex items-center justify-between gap-2 shrink-0 z-20 overflow-x-auto no-scrollbar">
      {/* Left: Live Flash Price & 24h Stats */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Live Flash Price Badge */}
        {livePrice !== null && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm sm:text-base font-mono font-bold transition-all duration-300 ${flashBgClass}`}
          >
            <span>{livePrice.toFixed(precision)}</span>
            <span className="text-2xs">{isUp ? '▲' : '▼'}</span>
          </div>
        )}

        {/* 24h Stats */}
        {tickerStats && (
          <div className="hidden md:flex items-center gap-3 text-xs font-mono border-l border-theme-border-subtle pl-3">
            <div className="flex flex-col">
              <span className="text-2xs text-theme-text-muted uppercase font-sans">
                {chartContent.stats.change24h}
              </span>
              <span
                className={`font-semibold text-2xs sm:text-xs ${
                  tickerStats.priceChange >= 0
                    ? 'text-theme-positive-base'
                    : 'text-theme-negative-base'
                }`}
              >
                {tickerStats.priceChange >= 0 ? '+' : ''}
                {tickerStats.priceChange.toFixed(precision)} (
                {tickerStats.priceChange >= 0 ? '+' : ''}
                {tickerStats.priceChangePercent.toFixed(2)}%)
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-2xs text-theme-text-muted uppercase font-sans">
                {chartContent.stats.high24h}
              </span>
              <span className="text-theme-text-primary font-medium text-2xs sm:text-xs">
                {tickerStats.high.toFixed(precision)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-2xs text-theme-text-muted uppercase font-sans">
                {chartContent.stats.low24h}
              </span>
              <span className="text-theme-text-primary font-medium text-2xs sm:text-xs">
                {tickerStats.low.toFixed(precision)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Center: Timeframe Selector */}
      <div className="flex items-center gap-1 bg-theme-bg-elevated p-0.5 rounded-lg border border-theme-border-subtle shrink-0">
        {timeframes.map((tf) => {
          const isActive = tf.id === activeTimeframe;
          return (
            <button
              key={tf.id}
              type="button"
              onClick={() => onTimeframeSelect(tf.id)}
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

      {/* Right: Connection Status & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Live WS Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-theme-bg-elevated border border-theme-border-subtle text-2xs font-mono text-theme-text-muted select-none">
          <span
            className={`size-1.5 rounded-full ${
              wsStatus === 'connected'
                ? 'bg-theme-positive-base animate-pulse'
                : wsStatus === 'connecting'
                ? 'bg-theme-brand-binance animate-ping'
                : 'bg-theme-negative-base'
            }`}
          />
          <span>
            {wsStatus === 'connected'
              ? chartContent.liveStreamBadge
              : wsStatus === 'connecting'
              ? chartContent.connectingBadge
              : chartContent.offlineBadge}
          </span>
        </div>

        {/* Reset Zoom Button */}
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onResetZoom}
          title={chartContent.resetZoomTooltip}
          className="flex items-center gap-1 px-2 py-1 text-2xs rounded-lg bg-theme-bg-elevated hover:bg-theme-bg-surface text-theme-text-secondary hover:text-theme-text-primary border border-theme-border-subtle transition-colors cursor-pointer select-none"
        >
          <RefreshCw className="size-3" />
          <span className="hidden sm:inline">{chartContent.resetZoom}</span>
        </motion.button>

        {/* Fullscreen Toggle Button */}
        <motion.button
          type="button"
          whileTap={tapScalePill}
          onClick={onToggleFullscreen}
          title={chartContent.fullscreenTooltip}
          className="size-7 rounded-lg bg-theme-bg-elevated hover:bg-theme-bg-surface text-theme-text-secondary hover:text-theme-text-primary border border-theme-border-subtle flex items-center justify-center transition-colors cursor-pointer select-none"
        >
          {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        </motion.button>
      </div>
    </div>
  );
});
