'use client';

import React from 'react';
import { Layers, Loader2 } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { LiveOrderBookData, StreamConnectionStatus } from '@/lib/binance-websocket';

interface OrderBookDepthCardProps {
  symbol: string;
  orderBook: LiveOrderBookData | null;
  status?: StreamConnectionStatus;
}

export const OrderBookDepthCard = React.memo(function OrderBookDepthCard({
  orderBook,
}: OrderBookDepthCardProps) {
  const content = APP_CONTENT.marketPanel;

  return (
    <div className="flex flex-col gap-2.5 p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs sm:text-sm font-bold text-theme-text-primary tracking-wide">
            {content.orderBookTitle}
          </span>
        </div>
      </div>

      {orderBook ? (
        <>
          {/* Depth Imbalance Gauge */}
          <div className="flex flex-col gap-1 pt-0.5">
            <div className="flex items-center justify-between text-2xs font-mono">
              <span className="text-theme-status-success font-bold">
                {content.bidsRatio} {orderBook.bidRatio}%
              </span>
              <span className="text-theme-text-muted font-semibold">
                {content.imbalance}
              </span>
              <span className="text-theme-status-danger font-bold">
                {orderBook.askRatio}% {content.asksRatio}
              </span>
            </div>

            <div className="h-1.5 w-full bg-theme-bg-elevated rounded-full overflow-hidden flex">
              <div
                className="h-full bg-theme-status-success transition-all duration-300"
                style={{ width: `${orderBook.bidRatio}%` }}
              />
              <div
                className="h-full bg-theme-status-danger transition-all duration-300"
                style={{ width: `${orderBook.askRatio}%` }}
              />
            </div>
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-3 text-2xs font-mono font-semibold uppercase text-theme-text-muted pt-1 border-b border-theme-border-subtle/50 pb-1">
            <span>{content.priceHeader}</span>
            <span className="text-right">{content.sizeHeader}</span>
            <span className="text-right">{content.totalHeader}</span>
          </div>

          {/* Asks (Sell Orders - Top of Book descending to best ask) */}
          <div className="flex flex-col gap-0.5">
            {orderBook.asks.map((row, idx) => (
              <div
                key={`ask_${idx}_${row.price}`}
                className="group relative grid grid-cols-3 items-center py-0.5 px-1 rounded text-2xs font-mono overflow-hidden"
              >
                {/* Liquidity Depth Bar */}
                <div
                  className="absolute inset-y-0 right-0 bg-theme-status-danger/15 rounded pointer-events-none transition-all duration-150"
                  style={{ width: `${row.depthPercent}%` }}
                />

                <span className="relative z-10 text-theme-status-danger font-bold">
                  {row.price.toLocaleString('en-US', {
                    minimumFractionDigits: orderBook.precision,
                    maximumFractionDigits: orderBook.precision,
                  })}
                </span>
                <span className="relative z-10 text-right text-theme-text-secondary">
                  {row.qty.toFixed(orderBook.precision === 4 ? 2 : 3)}
                </span>
                <span className="relative z-10 text-right text-theme-text-muted text-[11px]">
                  {row.total.toFixed(orderBook.precision === 4 ? 2 : 3)}
                </span>
              </div>
            ))}
          </div>

          {/* Middle Spread Divider */}
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-theme-bg-elevated/70 border border-theme-border-subtle text-2xs font-mono my-0.5">
            <span className="text-theme-text-muted uppercase font-bold">
              {content.spread}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-theme-text-primary font-bold">
                ${orderBook.spread.toFixed(orderBook.precision)}
              </span>
              <span className="text-theme-text-muted">
                ({orderBook.spreadPercent}%)
              </span>
            </div>
          </div>

          {/* Bids (Buy Orders - Bottom of Book starting from best bid down) */}
          <div className="flex flex-col gap-0.5">
            {orderBook.bids.map((row, idx) => (
              <div
                key={`bid_${idx}_${row.price}`}
                className="group relative grid grid-cols-3 items-center py-0.5 px-1 rounded text-2xs font-mono overflow-hidden"
              >
                {/* Liquidity Depth Bar */}
                <div
                  className="absolute inset-y-0 right-0 bg-theme-status-success/15 rounded pointer-events-none transition-all duration-150"
                  style={{ width: `${row.depthPercent}%` }}
                />

                <span className="relative z-10 text-theme-status-success font-bold">
                  {row.price.toLocaleString('en-US', {
                    minimumFractionDigits: orderBook.precision,
                    maximumFractionDigits: orderBook.precision,
                  })}
                </span>
                <span className="relative z-10 text-right text-theme-text-secondary">
                  {row.qty.toFixed(orderBook.precision === 4 ? 2 : 3)}
                </span>
                <span className="relative z-10 text-right text-theme-text-muted text-[11px]">
                  {row.total.toFixed(orderBook.precision === 4 ? 2 : 3)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Connecting Skeleton State */
        <div className="flex flex-col gap-2 py-4 animate-pulse">
          <div className="h-4 w-32 rounded bg-theme-bg-elevated" />
          <div className="h-2 w-full rounded bg-theme-bg-elevated" />
          <div className="flex flex-col gap-1.5 py-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-theme-bg-elevated/60" />
            ))}
          </div>
          <span className="inline-flex items-center justify-center gap-1.5 text-2xs font-mono text-theme-text-muted">
            <Loader2 className="size-3 animate-spin text-theme-brand-binance" />
            {content.loadingDepth}
          </span>
        </div>
      )}
    </div>
  );
});

OrderBookDepthCard.displayName = 'OrderBookDepthCard';
