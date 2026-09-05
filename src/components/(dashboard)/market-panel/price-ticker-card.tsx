'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { parseSymbolAssets } from '@/hooks/use-chat-sessions';

interface PriceTickerCardProps {
  symbol: string;
}

interface TickerBaseline {
  price: number;
  high24h: number;
  low24h: number;
  changePercent: number;
  volumeBase: number;
  volumeQuote: number;
  precision: number;
}

const SYMBOL_BASELINES: Record<string, TickerBaseline> = {
  BTCUSDT: {
    price: 89420.5,
    high24h: 91200.0,
    low24h: 87150.0,
    changePercent: 2.61,
    volumeBase: 38450.12,
    volumeQuote: 3438200000,
    precision: 2,
  },
  ETHUSDT: {
    price: 2685.75,
    high24h: 2750.0,
    low24h: 2610.5,
    changePercent: 1.84,
    volumeBase: 245100.5,
    volumeQuote: 658200000,
    precision: 2,
  },
  SOLUSDT: {
    price: 184.25,
    high24h: 192.5,
    low24h: 178.1,
    changePercent: 3.45,
    volumeBase: 1850400.0,
    volumeQuote: 341200000,
    precision: 2,
  },
  BNBUSDT: {
    price: 642.1,
    high24h: 655.0,
    low24h: 630.5,
    changePercent: 0.95,
    volumeBase: 420500.0,
    volumeQuote: 270100000,
    precision: 2,
  },
  DOGEUSDT: {
    price: 0.2245,
    high24h: 0.241,
    low24h: 0.215,
    changePercent: -1.82,
    volumeBase: 125000000.0,
    volumeQuote: 28000000,
    precision: 4,
  },
};

export function PriceTickerCard({ symbol }: PriceTickerCardProps) {
  const content = APP_CONTENT.marketPanel;
  const clean = symbol.toUpperCase();
  const { baseAsset, quoteAsset } = useMemo(() => parseSymbolAssets(clean), [clean]);

  const baseline = useMemo(() => {
    return (
      SYMBOL_BASELINES[clean] || {
        price: 100.0,
        high24h: 105.0,
        low24h: 96.5,
        changePercent: 2.15,
        volumeBase: 500000,
        volumeQuote: 50000000,
        precision: 2,
      }
    );
  }, [clean]);

  const [currentPrice, setCurrentPrice] = useState(baseline.price);
  const [flashDirection, setFlashDirection] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef(baseline.price);

  // Subtle real-time tick pulse simulation (flashes green/red on ticks)
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * (baseline.price * 0.0006);
      const nextPrice = Number((prevPriceRef.current + delta).toFixed(baseline.precision));
      const direction = nextPrice >= prevPriceRef.current ? 'up' : 'down';

      setFlashDirection(direction);
      prevPriceRef.current = nextPrice;
      setCurrentPrice(nextPrice);

      const timeout = setTimeout(() => {
        setFlashDirection(null);
      }, 700);

      return () => clearTimeout(timeout);
    }, 2400);

    return () => clearInterval(interval);
  }, [baseline]);

  const isPositive = baseline.changePercent >= 0;
  const rangeSpan = baseline.high24h - baseline.low24h || 1;
  const rangePositionPercent = Math.min(
    100,
    Math.max(0, Math.round(((currentPrice - baseline.low24h) / rangeSpan) * 100))
  );

  const formattedPrice = currentPrice.toLocaleString('en-US', {
    minimumFractionDigits: baseline.precision,
    maximumFractionDigits: baseline.precision,
  });

  return (
    <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs">
      {/* Top Header: Pair & Live WS Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-extrabold tracking-wider text-theme-text-primary">
            {quoteAsset ? `${baseAsset} / ${quoteAsset}` : baseAsset}
          </span>
          <span className="text-2xs font-mono font-bold text-theme-brand-binance bg-theme-brand-binance/10 border border-theme-brand-binance/25 px-1.5 py-0.5 rounded">
            SPOT
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-theme-bg-elevated border border-theme-border-subtle">
          <Radio className="size-3 text-theme-status-success animate-pulse" />
          <span className="text-2xs font-mono font-semibold text-theme-text-muted">
            {content.streamRateTicker}
          </span>
        </div>
      </div>

      {/* Hero Price & 24h Change Pill */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex flex-col">
          <motion.span
            key={currentPrice}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 1 }}
            className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-colors duration-300 ${
              flashDirection === 'up'
                ? 'text-theme-status-success'
                : flashDirection === 'down'
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
            {baseline.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 24h High / Low Visual Range Bar */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center justify-between text-2xs font-mono text-theme-text-muted">
          <span>
            {content.low24h}: ${baseline.low24h.toLocaleString('en-US')}
          </span>
          <span>
            {content.high24h}: ${baseline.high24h.toLocaleString('en-US')}
          </span>
        </div>

        <div className="relative h-1.5 w-full bg-theme-bg-elevated rounded-full overflow-hidden">
          <div
            className="absolute top-0 bottom-0 left-0 bg-theme-brand-binance/80 rounded-full transition-all duration-500"
            style={{ width: `${rangePositionPercent}%` }}
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
            {baseline.volumeBase.toLocaleString('en-US', { maximumFractionDigits: 1 })}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-theme-text-muted uppercase font-semibold">
            {content.volumeQuote}
          </span>
          <span className="text-theme-text-primary font-bold mt-0.5">
            ${(baseline.volumeQuote / 1_000_000).toFixed(2)}M
          </span>
        </div>
      </div>
    </div>
  );
}
