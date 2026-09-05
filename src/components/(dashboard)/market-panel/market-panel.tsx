'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PanelRightClose, Radio, Globe } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { sidebarSpringTransition, tapScalePill } from '@/constants/animation';
import { PriceTickerCard } from './price-ticker-card';
import { OrderBookDepthCard } from './order-book-depth-card';

interface MarketPanelProps {
  isOpen: boolean;
  symbol: string;
  isGlobal: boolean;
  onClose: () => void;
}

export function MarketPanel({ isOpen, symbol, isGlobal, onClose }: MarketPanelProps) {
  const content = APP_CONTENT.marketPanel;

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? 340 : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={sidebarSpringTransition}
      className="h-full bg-theme-bg-surface border-l border-theme-border-subtle flex flex-col shrink-0 select-none z-20 overflow-hidden relative will-change-[width,opacity]"
      aria-label={content.title}
    >
      <div className="w-[340px] h-full flex flex-col overflow-hidden">
        {/* Panel Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-theme-border-subtle shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-text-primary">
              {content.title}
            </span>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-theme-brand-binance/10 border border-theme-brand-binance/30">
              <Radio className="size-2.5 text-theme-brand-binance animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-theme-brand-binance">
                {content.liveBadge}
              </span>
            </div>
          </div>

          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={onClose}
            title={content.collapsePanel}
            aria-label={content.collapsePanel}
            className="size-7 rounded-lg flex items-center justify-center text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-elevated transition-colors cursor-pointer"
          >
            <PanelRightClose className="size-4" />
          </motion.button>
        </div>

        {/* Scrollable Panel Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 flex flex-col gap-3.5">
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
              {/* Module 1: Price & 24h Ticker Pulse */}
              <PriceTickerCard key={`ticker_${symbol}`} symbol={symbol} />

              {/* Module 2: Micro Order Book Depth Ladder */}
              <OrderBookDepthCard key={`depth_${symbol}`} symbol={symbol} />

              {/* Prototype / Next-Phase Notice */}
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
