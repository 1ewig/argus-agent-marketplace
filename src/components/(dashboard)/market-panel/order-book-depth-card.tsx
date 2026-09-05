'use client';

import React, { useMemo } from 'react';
import { Layers, Activity } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

interface OrderBookDepthCardProps {
  symbol: string;
}

interface OrderBookEntry {
  price: number;
  qty: number;
  total: number;
}

export function OrderBookDepthCard({ symbol }: OrderBookDepthCardProps) {
  const content = APP_CONTENT.marketPanel;
  const clean = symbol.toUpperCase();

  // Baseline mid price per symbol
  const midPrice = useMemo(() => {
    switch (clean) {
      case 'BTCUSDT':
        return 89420.0;
      case 'ETHUSDT':
        return 2685.5;
      case 'SOLUSDT':
        return 184.2;
      case 'BNBUSDT':
        return 642.0;
      case 'DOGEUSDT':
        return 0.2245;
      default:
        return 100.0;
    }
  }, [clean]);

  const tickStep = useMemo(() => {
    if (midPrice > 10000) return 1.5;
    if (midPrice > 1000) return 0.25;
    if (midPrice > 10) return 0.05;
    return 0.0001;
  }, [midPrice]);

  const precision = useMemo(() => {
    if (midPrice < 1) return 4;
    return 2;
  }, [midPrice]);

  // Generate realistic 6-level Asks (descending from highest ask down to best ask)
  const asks: OrderBookEntry[] = useMemo(() => {
    const rows: OrderBookEntry[] = [];
    let cum = 0;
    const basePrices = [6, 5, 4, 3, 2, 1];

    for (const step of basePrices) {
      const p = Number((midPrice + step * tickStep).toFixed(precision));
      const q = Number(((0.45 + (step % 3) * 0.35) * (midPrice > 1000 ? 1.2 : 45)).toFixed(3));
      cum += q;
      rows.push({ price: p, qty: q, total: Number(cum.toFixed(3)) });
    }
    return rows;
  }, [midPrice, tickStep, precision]);

  // Generate realistic 6-level Bids (descending from best bid down to lowest bid)
  const bids: OrderBookEntry[] = useMemo(() => {
    const rows: OrderBookEntry[] = [];
    let cum = 0;
    const basePrices = [1, 2, 3, 4, 5, 6];

    for (const step of basePrices) {
      const p = Number((midPrice - step * tickStep).toFixed(precision));
      const q = Number(((0.55 + (step % 4) * 0.4) * (midPrice > 1000 ? 1.4 : 52)).toFixed(3));
      cum += q;
      rows.push({ price: p, qty: q, total: Number(cum.toFixed(3)) });
    }
    return rows;
  }, [midPrice, tickStep, precision]);

  const maxTotal = useMemo(() => {
    const maxAsk = asks[asks.length - 1]?.total || 1;
    const maxBid = bids[bids.length - 1]?.total || 1;
    return Math.max(maxAsk, maxBid);
  }, [asks, bids]);

  const bestAsk = asks[asks.length - 1]?.price || midPrice + tickStep;
  const bestBid = bids[0]?.price || midPrice - tickStep;
  const spreadValue = Number((bestAsk - bestBid).toFixed(precision));
  const spreadPercent = ((spreadValue / midPrice) * 100).toFixed(3);

  // Depth Imbalance: 62% Bids / 38% Asks
  const totalBidVol = bids.reduce((acc, b) => acc + b.qty, 0);
  const totalAskVol = asks.reduce((acc, a) => acc + a.qty, 0);
  const totalDepth = totalBidVol + totalAskVol || 1;
  const bidRatio = Math.round((totalBidVol / totalDepth) * 100);
  const askRatio = 100 - bidRatio;

  return (
    <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs font-bold text-theme-text-primary tracking-wide">
            {content.orderBookTitle}
          </span>
        </div>

        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-theme-bg-elevated border border-theme-border-subtle text-2xs font-mono font-semibold text-theme-text-muted">
          <Activity className="size-2.5 text-theme-brand-binance animate-pulse" />
          <span>{content.streamRateDepth}</span>
        </div>
      </div>

      {/* Depth Imbalance Gauge */}
      <div className="flex flex-col gap-1 pt-0.5">
        <div className="flex items-center justify-between text-2xs font-mono">
          <span className="text-theme-status-success font-bold">
            {content.bidsRatio} {bidRatio}%
          </span>
          <span className="text-theme-text-muted font-semibold">
            {content.imbalance}
          </span>
          <span className="text-theme-status-danger font-bold">
            {askRatio}% {content.asksRatio}
          </span>
        </div>

        <div className="h-1.5 w-full bg-theme-bg-elevated rounded-full overflow-hidden flex">
          <div
            className="h-full bg-theme-status-success transition-all duration-300"
            style={{ width: `${bidRatio}%` }}
          />
          <div
            className="h-full bg-theme-status-danger transition-all duration-300"
            style={{ width: `${askRatio}%` }}
          />
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 text-2xs font-mono font-semibold uppercase text-theme-text-muted pt-1 border-b border-theme-border-subtle/50 pb-1">
        <span>{content.priceHeader}</span>
        <span className="text-right">{content.sizeHeader}</span>
        <span className="text-right">{content.totalHeader}</span>
      </div>

      {/* Asks (Sell Orders - Top of Book) */}
      <div className="flex flex-col gap-0.5">
        {asks.map((row, idx) => {
          const depthPercent = Math.min(100, Math.round((row.total / maxTotal) * 100));
          return (
            <div
              key={`ask_${idx}`}
              className="group relative grid grid-cols-3 items-center py-0.5 px-1 rounded text-2xs font-mono overflow-hidden"
            >
              {/* Liquidity Depth Bar */}
              <div
                className="absolute inset-y-0 right-0 bg-theme-status-danger/15 rounded pointer-events-none transition-all duration-200"
                style={{ width: `${depthPercent}%` }}
              />

              <span className="relative z-10 text-theme-status-danger font-bold">
                {row.price.toLocaleString('en-US', {
                  minimumFractionDigits: precision,
                  maximumFractionDigits: precision,
                })}
              </span>
              <span className="relative z-10 text-right text-theme-text-secondary">
                {row.qty.toFixed(precision === 4 ? 2 : 3)}
              </span>
              <span className="relative z-10 text-right text-theme-text-muted text-[11px]">
                {row.total.toFixed(precision === 4 ? 2 : 3)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Middle Spread Divider */}
      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-theme-bg-elevated/70 border border-theme-border-subtle text-2xs font-mono my-0.5">
        <span className="text-theme-text-muted uppercase font-bold">
          {content.spread}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-theme-text-primary font-bold">
            ${spreadValue.toFixed(precision)}
          </span>
          <span className="text-theme-text-muted">
            ({spreadPercent}%)
          </span>
        </div>
      </div>

      {/* Bids (Buy Orders - Bottom of Book) */}
      <div className="flex flex-col gap-0.5">
        {bids.map((row, idx) => {
          const depthPercent = Math.min(100, Math.round((row.total / maxTotal) * 100));
          return (
            <div
              key={`bid_${idx}`}
              className="group relative grid grid-cols-3 items-center py-0.5 px-1 rounded text-2xs font-mono overflow-hidden"
            >
              {/* Liquidity Depth Bar */}
              <div
                className="absolute inset-y-0 right-0 bg-theme-status-success/15 rounded pointer-events-none transition-all duration-200"
                style={{ width: `${depthPercent}%` }}
              />

              <span className="relative z-10 text-theme-status-success font-bold">
                {row.price.toLocaleString('en-US', {
                  minimumFractionDigits: precision,
                  maximumFractionDigits: precision,
                })}
              </span>
              <span className="relative z-10 text-right text-theme-text-secondary">
                {row.qty.toFixed(precision === 4 ? 2 : 3)}
              </span>
              <span className="relative z-10 text-right text-theme-text-muted text-[11px]">
                {row.total.toFixed(precision === 4 ? 2 : 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
