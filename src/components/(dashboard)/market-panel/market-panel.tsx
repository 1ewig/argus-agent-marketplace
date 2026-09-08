'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONTENT } from '@/constants/content';
import { sidebarSpringTransition } from '@/constants/animation';
import type {
  LiveTickerData,
  LiveOrderBookData,
  StreamConnectionStatus,
} from '@/lib/binance-websocket';
import { useMarketPanelData } from '@/hooks';
import { MarketPanelBody } from './market-panel-body';

export interface MarketPanelProps {
  isOpen: boolean;
  symbol: string;
  isGlobal: boolean;
  ticker?: LiveTickerData | null;
  orderBook?: LiveOrderBookData | null;
  spotStatus?: StreamConnectionStatus;
}

/**
 * Main orchestrator for the MarketPanel workspace deck.
 * Delegates data fetching to `useMarketPanelData` and presentation to `MarketPanelBody`.
 */
export function MarketPanel({
  isOpen,
  symbol,
  isGlobal,
  ticker = null,
  orderBook = null,
  spotStatus = 'idle',
}: MarketPanelProps) {
  const content = APP_CONTENT.marketPanel;

  const {
    global,
    futures,
  } = useMarketPanelData({ symbol, isGlobal, isOpen });

  const sharedBodyProps = {
    isGlobal,
    symbol,
    ticker,
    orderBook,
    spotStatus,
    globalData: global.data,
    isGlobalLoading: global.isLoading,
    isGlobalFetching: global.isFetching || global.isRefreshing,
    isGlobalError: global.isError,
    onRetryGlobal: global.handleRefresh,
    futuresData: futures.data,
    isFuturesAvailable: futures.isAvailable,
    futuresCountdownFormatted: futures.countdownFormatted,
  };

  return (
    <>
      {/* 1. Desktop Collapsible Side Column (Hidden on mobile) */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? '42%' : '0%',
          opacity: isOpen ? 1 : 0,
        }}
        transition={sidebarSpringTransition}
        className="hidden md:flex h-full bg-theme-bg-surface border-l border-theme-border-subtle flex-col shrink-0 select-none z-20 overflow-hidden relative will-change-[width,opacity]"
        aria-label={content.title}
      >
        <div className="w-full min-w-[340px] h-full flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
            <MarketPanelBody {...sharedBodyProps} />
          </div>
        </div>
      </motion.aside>

      {/* 2. Mobile Full-Screen Overlay (100% full screen on mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-market-panel-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={content.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-50 md:hidden w-full h-dvh bg-theme-bg-base flex flex-col select-none overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 flex flex-col gap-3.5 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
              <MarketPanelBody {...sharedBodyProps} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
