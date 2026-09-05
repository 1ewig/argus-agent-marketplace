'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Globe, Loader2 } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { sidebarSpringTransition } from '@/constants/animation';
import { useBinanceMarketStream } from '@/hooks/use-binance-market-stream';
import { PriceTickerCard } from './price-ticker-card';
import { FuturesFundingCard } from './futures-funding-card';
import { OrderBookDepthCard } from './order-book-depth-card';

interface MarketPanelProps {
  isOpen: boolean;
  symbol: string;
  isGlobal: boolean;
}

export function MarketPanel({ isOpen, symbol, isGlobal }: MarketPanelProps) {
  const content = APP_CONTENT.marketPanel;

  // Real-time client-direct Binance WebSocket connection
  const { ticker, orderBook, status } = useBinanceMarketStream(symbol, {
    enabled: isOpen && !isGlobal,
    depthLevels: 8,
  });

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? '40%' : '0%',
        opacity: isOpen ? 1 : 0,
      }}
      transition={sidebarSpringTransition}
      className="h-full bg-theme-bg-surface border-l border-theme-border-subtle flex flex-col shrink-0 select-none z-20 overflow-hidden relative will-change-[width,opacity]"
      aria-label={content.title}
    >
      <div className="w-full min-w-[340px] h-full flex flex-col overflow-hidden">
        {/* Panel Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-theme-border-subtle shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-text-primary">
              {content.title}
            </span>

            {/* Connection Status Badge */}
            {!isGlobal && (
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${
                  status === 'connected'
                    ? 'bg-theme-status-success/10 border-theme-status-success/30 text-theme-status-success'
                    : status === 'connecting' || status === 'reconnecting'
                    ? 'bg-theme-brand-binance/10 border-theme-brand-binance/30 text-theme-brand-binance'
                    : 'bg-theme-status-danger/10 border-theme-status-danger/30 text-theme-status-danger'
                }`}
              >
                {status === 'connected' ? (
                  <Radio className="size-2.5 animate-pulse" />
                ) : status === 'connecting' || status === 'reconnecting' ? (
                  <Loader2 className="size-2.5 animate-spin" />
                ) : (
                  <span className="size-1.5 rounded-full bg-theme-status-danger" />
                )}
                <span className="text-[10px] font-mono font-bold tracking-tight">
                  {status === 'connected'
                    ? content.statusConnected
                    : status === 'connecting'
                    ? content.statusConnecting
                    : status === 'reconnecting'
                    ? content.statusReconnecting
                    : content.statusError}
                </span>
              </div>
            )}
          </div>

          <span className="text-2xs font-mono text-theme-text-muted font-bold tracking-wide">
            {isGlobal ? '' : symbol.toUpperCase()}
          </span>
        </div>

        {/* Scrollable Panel Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-4 flex flex-col gap-3.5 sm:gap-4">
          {isGlobal ? (
            <div className="flex flex-col items-center justify-center text-center p-6 rounded-xl bg-theme-bg-elevated/40 border border-theme-border-subtle/80 my-auto">
              <div className="size-10 rounded-xl bg-theme-bg-surface border border-theme-border-subtle flex items-center justify-center mb-3 shadow-2xs">
                <Globe className="size-5 text-theme-brand-binance" />
              </div>
              <h4 className="text-sm font-bold text-theme-text-primary mb-1">
                {content.globalTitle}
              </h4>
              <p className="text-xs text-theme-text-secondary leading-relaxed max-w-xs">
                {content.globalEmptyNotice}
              </p>
            </div>
          ) : (
            <>
              {/* Module 1: Price & 24h Ticker Pulse with Micro Sparkline */}
              <PriceTickerCard
                key={`ticker_${symbol}`}
                symbol={symbol}
                ticker={ticker}
                status={status}
              />

              {/* Module 2: Perpetual Futures Sentinel (Funding Rate & Countdown) */}
              <FuturesFundingCard
                key={`futures_${symbol}`}
                symbol={symbol}
                isOpen={isOpen}
              />

              {/* Module 3: Micro Order Book Depth Ladder */}
              <OrderBookDepthCard
                key={`depth_${symbol}`}
                symbol={symbol}
                orderBook={orderBook}
                status={status}
              />

              {/* Verified Stream Notice */}
              <div className="text-[10px] font-mono text-center text-theme-text-muted/70 py-1 select-none">
                {content.mockupNotice}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
