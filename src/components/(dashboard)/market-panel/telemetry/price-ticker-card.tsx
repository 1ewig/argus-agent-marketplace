'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { parseSymbolAssets } from '@/lib/symbols';
import { formatPrice } from '@/lib/utils';
import type { LiveTickerData, StreamConnectionStatus } from '@/lib/binance-websocket';
import { PriceSparkline } from './price-sparkline';

interface PriceTickerCardProps {
  symbol: string;
  ticker: LiveTickerData | null;
  status?: StreamConnectionStatus;
}

export const PriceTickerCard = React.memo(function PriceTickerCard({
  symbol,
  ticker,
}: PriceTickerCardProps) {
  const content = APP_CONTENT.marketPanel;
  const clean = symbol.toUpperCase();
  const { baseAsset, quoteAsset } = useMemo(() => parseSymbolAssets(clean), [clean]);

  const isPositive = (ticker?.changePercent ?? 0) >= 0;
  const formattedPrice = formatPrice(ticker?.price, ticker?.precision ?? 2);

  return (
    <div className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs">
      {/* Top Header: Pair (Left) & 24h Change Pill (Far Right) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-sm font-extrabold tracking-wider text-theme-text-primary">
            {quoteAsset ? `${baseAsset} / ${quoteAsset}` : baseAsset}
          </span>
          <span className="text-2xs font-mono font-bold text-theme-brand-binance bg-theme-brand-binance/10 border border-theme-brand-binance/25 px-1.5 py-0.5 rounded">
            SPOT
          </span>
        </div>

        {ticker && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold font-mono select-none shrink-0 ${isPositive
                ? 'bg-theme-status-success/15 text-theme-status-success border border-theme-status-success/20'
                : 'bg-theme-status-danger/15 text-theme-status-danger border border-theme-status-danger/20'
              }`}
          >
            {isPositive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            <span>
              {isPositive ? '+' : ''}
              {ticker.changePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Hero Price */}
      {ticker ? (
        <>
          <div className="flex flex-col">
            <motion.span
              key={ticker.price}
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 1 }}
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-colors duration-300 ${ticker.flashDirection === 'up'
                  ? 'text-theme-status-success'
                  : ticker.flashDirection === 'down'
                    ? 'text-theme-status-danger'
                    : 'text-theme-text-primary'
                }`}
            >
              ${formattedPrice}
            </motion.span>
          </div>

          {/* 24h High / Low Visual Range Bar */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-2xs font-mono text-theme-text-muted">
              <span>
                {content.low24h}: ${ticker.low24h.toLocaleString('en-US')}
              </span>
              <span>
                {content.high24h}: ${ticker.high24h.toLocaleString('en-US')}
              </span>
            </div>

            <div className="relative h-1.5 w-full bg-theme-bg-elevated rounded-full overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-0 bg-theme-brand-binance/80 rounded-full transition-all duration-300"
                style={{ width: `${ticker.rangePositionPercent}%` }}
              />
            </div>
          </div>

          {/* Micro SVG Sparkline (30m Trend) */}
          <PriceSparkline symbol={symbol} currentPrice={ticker.price} />

          {/* Volume Summary Footprint */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-theme-border-subtle/50 text-2xs font-mono">
            <div className="flex flex-col">
              <span className="text-theme-text-muted uppercase font-semibold">
                {content.volume24h} ({baseAsset})
              </span>
              <span className="text-theme-text-primary font-bold mt-0.5">
                {ticker.volumeBase.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-theme-text-muted uppercase font-semibold">
                {content.volumeQuote}
              </span>
              <span className="text-theme-text-primary font-bold mt-0.5">
                ${(ticker.volumeQuote / 1_000_000).toFixed(2)}M
              </span>
            </div>
          </div>
        </>
      ) : (
        /* Connecting Skeleton State */
        <div className="flex flex-col gap-3 py-2 animate-pulse">
          <div className="h-8 w-40 rounded-lg bg-theme-bg-elevated" />
          <div className="h-2 w-full rounded-full bg-theme-bg-elevated" />
          <div className="flex justify-between text-2xs font-mono text-theme-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin text-theme-brand-binance" />
              {content.loadingTicker}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

PriceTickerCard.displayName = 'PriceTickerCard';