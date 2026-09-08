'use client';

import React, { memo } from 'react';
import { APP_CONTENT } from '@/constants/content';
import type {
  LiveTickerData,
  LiveOrderBookData,
  StreamConnectionStatus,
  LiveFuturesFundingData,
} from '@/lib/binance-websocket';
import type { GlobalMarketOverviewData } from '@/lib/types';
import {
  PriceTickerCard,
  FuturesFundingCard,
  OrderBookDepthCard,
} from './telemetry';
import { GlobalMarketView } from './global';

export interface MarketPanelBodyProps {
  isGlobal: boolean;
  symbol: string;
  ticker?: LiveTickerData | null;
  orderBook?: LiveOrderBookData | null;
  spotStatus?: StreamConnectionStatus;
  globalData?: GlobalMarketOverviewData | null;
  isGlobalLoading?: boolean;
  isGlobalFetching?: boolean;
  isGlobalError?: boolean;
  onRetryGlobal?: () => void;
  futuresData?: LiveFuturesFundingData | null;
  isFuturesAvailable?: boolean;
  futuresCountdownFormatted?: string;
}

/**
 * Pure presentation body component for MarketPanel cards and modules.
 */
export const MarketPanelBody = memo(function MarketPanelBody({
  isGlobal,
  symbol,
  ticker = null,
  orderBook = null,
  spotStatus = 'idle',
  globalData,
  isGlobalLoading = false,
  isGlobalFetching = false,
  isGlobalError = false,
  onRetryGlobal,
  futuresData = null,
  isFuturesAvailable = false,
  futuresCountdownFormatted = '',
}: MarketPanelBodyProps) {
  const content = APP_CONTENT.marketPanel;

  if (isGlobal) {
    return (
      <GlobalMarketView
        data={globalData || undefined}
        isLoading={isGlobalLoading}
        isFetching={isGlobalFetching}
        isError={isGlobalError}
        onRetry={onRetryGlobal ?? (() => {})}
      />
    );
  }

  return (
    <>
      {/* Module 1: Price & 24h Ticker Pulse with Micro Sparkline */}
      <PriceTickerCard
        key={`ticker_${symbol}`}
        symbol={symbol}
        ticker={ticker ?? null}
        status={spotStatus}
      />

      {/* Module 2: Perpetual Futures Sentinel (Funding Rate & Countdown) */}
      <FuturesFundingCard
        key={`futures_${symbol}`}
        data={futuresData ?? null}
        isAvailable={isFuturesAvailable}
        countdownFormatted={futuresCountdownFormatted}
      />

      {/* Module 3: Micro Order Book Depth Ladder */}
      <OrderBookDepthCard
        key={`depth_${symbol}`}
        symbol={symbol}
        orderBook={orderBook ?? null}
        status={spotStatus}
      />

      {/* Verified Stream Notice */}
      <div className="text-[10px] font-mono text-center text-theme-text-muted/70 py-1 select-none">
        {content.mockupNotice}
      </div>
    </>
  );
});
