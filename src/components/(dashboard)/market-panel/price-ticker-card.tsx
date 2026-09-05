'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Radio, Loader2 } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { parseSymbolAssets } from '@/hooks/use-chat-sessions';
import type { LiveTickerData, StreamConnectionStatus } from '@/lib/binance-websocket';

interface PriceTickerCardProps {
  symbol: string;
  ticker: LiveTickerData | null;
  status: StreamConnectionStatus;
}

export function PriceTickerCard({ symbol, ticker, status }: PriceTickerCardProps) {
  const content = APP_CONTENT.marketPanel;
  const clean = symbol.toUpperCase();
  const { baseAsset, quoteAsset } = useMemo(() => parseSymbolAssets(clean), [clean]);

  const isPositive = (ticker?.changePercent ?? 0) >= 0;

  const formattedPrice = useMemo(() => {
    if (!ticker) return '—';
    return ticker.price.toLocaleString('en-US', {
      minimumFractionDigits: ticker.precision,
      maximumFractionDigits: ticker.precision,
    });
  }, [ticker]);

  return (
    <div className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs">
      {/* Top Header: Pair & Live Stream Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-sm font-extrabold tracking-wider text-theme-text-primary">
            {quoteAsset ? `${baseAsset} / ${quoteAsset}` : baseAsset}
          </span>
          <span className="text-2xs font-mono font-bold text-theme-brand-binance bg-theme-brand-binance/10 border border-theme-brand-binance/25 px-1.5 py-0.5 rounded">
            SPOT
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-theme-bg-elevated border border-theme-border-subtle">
          {status === 'connected' ? (
            <Radio className="size-3 text-theme-status-success animate-pulse" />
          ) : status === 'reconnecting' || status === 'connecting' ? (
            <Loader2 className="size-3 text-theme-brand-binance animate-spin" />
          ) : (
            <span className="size-2 rounded-full bg-theme-status-danger" />
          )}
          <span className="text-2xs font-mono font-semibold text-theme-text-muted">
            {content.streamRateTicker}
          </span>
        </div>
      </div>

      {/* Hero Price & 24h Change Pill */}
      {ticker ? (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <motion.span
                key={ticker.price}
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 1 }}
                className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-colors duration-300 ${
                  ticker.flashDirection === 'up'
                    ? 'text-theme-status-success'
                    : ticker.flashDirection === 'down'
                    ? 'text-theme-status-danger'
                    : 'text-theme-text-primary'
                }`}
              >
                ${formattedPrice}
              </motion.span>
            </div>

            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono select-none ${
                isPositive
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
}
