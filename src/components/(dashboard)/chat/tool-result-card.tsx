'use client';

import React from 'react';
import {
  TrendingUp,
  Layers,
  BarChart3,
  Activity,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Percent,
  Calculator,
  History,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export interface ToolDisplayInfo {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  symbol?: string;
}

/**
 * Derives natural, humanized tool titles and contextual icons using tool arguments.
 */
export function getToolDisplayInfo(
  toolName?: string,
  toolArgs?: Record<string, unknown>
): ToolDisplayInfo {
  const normalizedName = toolName ?? '';
  const symbol = typeof toolArgs?.symbol === 'string' ? toolArgs.symbol.toUpperCase() : undefined;
  const interval = typeof toolArgs?.interval === 'string' ? toolArgs.interval : undefined;

  const labels = APP_CONTENT.process.toolLabels;

  switch (normalizedName) {
    case 'get_ticker_price':
      return {
        title: labels.get_ticker_price(symbol),
        icon: TrendingUp,
        symbol,
      };
    case 'get_order_book':
      return {
        title: labels.get_order_book(symbol),
        icon: Layers,
        symbol,
      };
    case 'get_klines':
      return {
        title: labels.get_klines(symbol, interval),
        icon: BarChart3,
        symbol,
      };
    case 'get_24h_stats':
      return {
        title: labels.get_24h_stats(symbol),
        icon: Activity,
        symbol,
      };
    case 'get_funding_rate':
      return {
        title: labels.get_funding_rate(symbol),
        icon: Percent,
        symbol,
      };
    case 'get_average_price':
      return {
        title: labels.get_average_price(symbol),
        icon: Calculator,
        symbol,
      };
    case 'get_recent_trades':
      return {
        title: labels.get_recent_trades(symbol),
        icon: History,
        symbol,
      };
    case 'get_open_interest':
      return {
        title: labels.get_open_interest(symbol),
        icon: Layers,
        symbol,
      };
    default:
      return {
        title: labels.default(normalizedName || 'tool'),
        icon: Sparkles,
        symbol,
      };
  }
}

/**
 * Formats numbers into clean currency strings, adapting precision for sub-penny crypto assets.
 */
function formatUsd(val: unknown): string {
  const num = typeof val === 'number' ? val : Number(val);
  if (Number.isNaN(num)) return '—';
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (num >= 1) return `$${num.toFixed(2)}`;
  if (num >= 0.0001) return `$${num.toFixed(4)}`;
  if (num > 0) return `$${num.toFixed(6)}`;
  return `$0.00`;
}

function formatPercent(val: unknown): { text: string; isPositive: boolean; isNegative: boolean } {
  const num = typeof val === 'number' ? val : Number(val);
  if (Number.isNaN(num)) return { text: '—', isPositive: false, isNegative: false };
  const prefix = num > 0 ? '+' : '';
  return {
    text: `${prefix}${num.toFixed(2)}%`,
    isPositive: num > 0,
    isNegative: num < 0,
  };
}

/**
 * Formats asset order quantities with dynamic precision.
 */
function formatOrderQty(val: unknown): string {
  const num = typeof val === 'number' ? val : Number(val);
  if (Number.isNaN(num)) return '—';
  if (num >= 1000) return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (num >= 10) return num.toFixed(2);
  if (num >= 1) return num.toFixed(3);
  if (num >= 0.0001) return Number(num.toFixed(4)).toString();
  return num.toString();
}

interface ToolResultCardProps {
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
}

/**
 * Minimal, low-profile stat item for multi-metric tool cards.
 */
function MetricItem({
  label,
  value,
  valueClassName = 'text-theme-text-primary',
  badge,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-text-muted truncate">
        {label}
      </span>
      <div className="flex items-baseline gap-1 mt-0.5 min-w-0">
        <span className={`text-xs font-bold font-mono truncate ${valueClassName}`}>{value}</span>
        {badge}
      </div>
    </div>
  );
}

/**
 * Organizes tool results into sleek, compact financial widgets.
 * Memoized to prevent re-rendering during timeline timer ticks.
 */
export const ToolResultCard = React.memo(function ToolResultCard({
  toolName,
  toolResult,
}: ToolResultCardProps) {
  const res = APP_CONTENT.process.results;

  const resultObj =
    toolResult && typeof toolResult === 'object' ? (toolResult as Record<string, unknown>) : null;

  const isError = resultObj?.success === false || Boolean(resultObj?.error);
  const errorMessage = typeof resultObj?.error === 'string' ? resultObj.error : null;

  const renderContent = () => {
    if (isError) {
      return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-theme-status-danger/10 border border-theme-status-danger/20 text-theme-status-danger text-xs font-medium">
          <AlertCircle className="size-3.5 shrink-0" />
          <span className="truncate">{errorMessage ?? res.errorTitle}</span>
        </div>
      );
    }

    if (!toolResult) {
      return (
        <span className="text-theme-text-muted text-xs italic py-1">
          {res.emptyResult}
        </span>
      );
    }

    switch (toolName) {
      /* ------------------------------------------------------------------------- */
      /* TICKER PRICE                                                              */
      /* ------------------------------------------------------------------------- */
      case 'get_ticker_price': {
        const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
        const price = data?.price ?? resultObj?.price;
        const symbol = typeof data?.symbol === 'string' ? data.symbol : undefined;

        return (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
            <div className="flex items-center gap-2">
              {symbol && (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider bg-theme-brand-binance/10 text-theme-brand-binance border border-theme-brand-binance/20">
                  {symbol}
                </span>
              )}
              <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-text-muted">
                {res.livePrice}
              </span>
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-base font-extrabold text-theme-text-primary tracking-tight">
                {formatUsd(price)}
              </span>
              <span className="text-[10px] font-medium text-theme-text-muted">USD</span>
            </div>
          </div>
        );
      }

      /* ------------------------------------------------------------------------- */
      /* ORDER BOOK                                                                */
      /* ------------------------------------------------------------------------- */
      case 'get_order_book': {
        const summary = (resultObj?.summary as Record<string, unknown>) ?? {};
        const bids = Array.isArray(resultObj?.bids) ? (resultObj.bids as Array<[number, number]>).slice(0, 3) : [];
        const asks = Array.isArray(resultObj?.asks) ? (resultObj.asks as Array<[number, number]>).slice(0, 3) : [];

        const maxBidQty = Math.max(...bids.map(([, q]) => Number(q) || 0), 0.0001);
        const maxAskQty = Math.max(...asks.map(([, q]) => Number(q) || 0), 0.0001);

        const totalBidQty = bids.reduce((acc, [, q]) => acc + (Number(q) || 0), 0);
        const totalAskQty = asks.reduce((acc, [, q]) => acc + (Number(q) || 0), 0);
        const totalDepth = totalBidQty + totalAskQty || 1;
        const bidRatio = Math.round((totalBidQty / totalDepth) * 100);

        return (
          <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
            {/* Top Stat Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 border-b border-theme-border-subtle/50">
              <MetricItem
                label={res.bestBid}
                value={formatUsd(summary.bestBid)}
                valueClassName="text-theme-status-success"
              />
              <MetricItem
                label={res.bestAsk}
                value={formatUsd(summary.bestAsk)}
                valueClassName="text-theme-status-danger"
              />
              <MetricItem
                label={res.spread}
                value={formatUsd(summary.spread)}
                badge={
                  <span className="text-[10px] text-theme-text-muted font-normal">
                    ({String(summary.spreadPercent ?? 0)}%)
                  </span>
                }
              />
              <MetricItem
                label={res.depthImbalance}
                value={`${String(summary.depthImbalanceRatio ?? '1.0')}x`}
                valueClassName="text-theme-text-secondary"
              />
            </div>

            {/* Depth Balance Bar */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-theme-text-muted">
              <span className="text-theme-status-success font-semibold">{bidRatio}%</span>
              <div className="flex-1 h-1 rounded-full bg-theme-bg-surface overflow-hidden flex">
                <div
                  className="h-full bg-theme-status-success/60 transition-all duration-300"
                  style={{ width: `${bidRatio}%` }}
                />
                <div
                  className="h-full bg-theme-status-danger/60 transition-all duration-300"
                  style={{ width: `${100 - bidRatio}%` }}
                />
              </div>
              <span className="text-theme-status-danger font-semibold">{100 - bidRatio}%</span>
            </div>

            {/* Micro Order Book Ladder */}
            {(bids.length > 0 || asks.length > 0) && (
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                {/* Bids */}
                <div className="flex flex-col gap-0.5">
                  {bids.map(([p, q], i) => {
                    const qty = Number(q) || 0;
                    const fillPercent = Math.min(100, Math.round((qty / maxBidQty) * 100));
                    return (
                      <div
                        key={`bid_${i}`}
                        className="relative flex justify-between items-center px-1.5 py-0.5 rounded overflow-hidden"
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-theme-status-success/10 rounded pointer-events-none"
                          style={{ width: `${fillPercent}%` }}
                        />
                        <span className="relative z-10 text-theme-status-success font-semibold">
                          {formatUsd(p)}
                        </span>
                        <span className="relative z-10 text-theme-text-muted text-[10px]">
                          {formatOrderQty(q)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Asks */}
                <div className="flex flex-col gap-0.5">
                  {asks.map(([p, q], i) => {
                    const qty = Number(q) || 0;
                    const fillPercent = Math.min(100, Math.round((qty / maxAskQty) * 100));
                    return (
                      <div
                        key={`ask_${i}`}
                        className="relative flex justify-between items-center px-1.5 py-0.5 rounded overflow-hidden"
                      >
                        <div
                          className="absolute inset-y-0 right-0 bg-theme-status-danger/10 rounded pointer-events-none"
                          style={{ width: `${fillPercent}%` }}
                        />
                        <span className="relative z-10 text-theme-status-danger font-semibold">
                          {formatUsd(p)}
                        </span>
                        <span className="relative z-10 text-theme-text-muted text-[10px]">
                          {formatOrderQty(q)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      }

      /* ------------------------------------------------------------------------- */
      /* 24H STATS                                                                 */
      /* ------------------------------------------------------------------------- */
      case 'get_24h_stats': {
        const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
        const change = formatPercent(data?.priceChangePercent);

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
            <MetricItem
              label={res.change24h}
              value={change.text}
              valueClassName={
                change.isPositive
                  ? 'text-theme-status-success'
                  : change.isNegative
                    ? 'text-theme-status-danger'
                    : 'text-theme-text-primary'
              }
            />
            <MetricItem label={res.high24h} value={formatUsd(data?.highPrice)} />
            <MetricItem label={res.low24h} value={formatUsd(data?.lowPrice)} />
            <MetricItem
              label={res.volume24h}
              value={formatUsd(data?.volumeQuote)}
              valueClassName="text-theme-text-secondary"
            />
          </div>
        );
      }

      /* ------------------------------------------------------------------------- */
      /* KLINES                                                                    */
      /* ------------------------------------------------------------------------- */
      case 'get_klines': {
        const change = formatPercent(resultObj?.periodChangePercent);

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
            <MetricItem
              label={res.timeframe}
              value={String(resultObj?.interval ?? '15m')}
              valueClassName="text-theme-brand-binance"
            />
            <MetricItem
              label={res.periodChange}
              value={change.text}
              valueClassName={
                change.isPositive
                  ? 'text-theme-status-success'
                  : change.isNegative
                    ? 'text-theme-status-danger'
                    : 'text-theme-text-primary'
              }
            />
            <MetricItem label={res.latestPrice} value={formatUsd(resultObj?.latestPrice)} />
            <MetricItem
              label={res.candlesCount}
              value={String(resultObj?.candleCount ?? '—')}
              valueClassName="text-theme-text-secondary"
            />
          </div>
        );
      }

      /* ------------------------------------------------------------------------- */
      /* FUNDING RATE                                                              */
      /* ------------------------------------------------------------------------- */
      case 'get_funding_rate': {
        const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
        const rate = typeof data?.lastFundingRate === 'number' ? data.lastFundingRate : 0;
        const ratePct = +(rate * 100).toFixed(4);
        const apr =
          typeof data?.annualizedRatePercent === 'number'
            ? data.annualizedRatePercent
            : +(ratePct * 3 * 365).toFixed(2);
        const isPositive = rate > 0;
        const nextTime =
          typeof data?.nextFundingTime === 'number'
            ? new Date(data.nextFundingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '—';

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
            <MetricItem
              label={res.fundingRate}
              value={rate > 0 ? `+${ratePct}%` : `${ratePct}%`}
              valueClassName={
                isPositive
                  ? 'text-theme-status-success'
                  : rate < 0
                    ? 'text-theme-status-danger'
                    : 'text-theme-text-primary'
              }
            />
            <MetricItem
              label={res.annualizedRate}
              value={`${apr > 0 ? `+${apr}%` : `${apr}%`}`}
              valueClassName="text-theme-brand-binance"
            />
            <MetricItem label={res.markPrice} value={formatUsd(data?.markPrice)} />
            <MetricItem
              label={res.nextFunding}
              value={nextTime}
              valueClassName="text-theme-text-secondary"
            />
          </div>
        );
      }

      /* ------------------------------------------------------------------------- */
      /* AVERAGE PRICE (VWAP)                                                      */
      /* ------------------------------------------------------------------------- */
      case 'get_average_price': {
        const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
        const avgPrice = typeof data?.price === 'number' ? data.price : Number(data?.price);
        const mins = data?.mins ?? 5;

        return (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-theme-brand-binance/10 text-theme-brand-binance border border-theme-brand-binance/20">
                {String(mins)}m VWAP
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-text-muted">
                {res.averagePrice}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-theme-text-primary">
              {formatUsd(avgPrice)}
            </span>
          </div>
        );
      }

      /* ------------------------------------------------------------------------- */
      /* RECENT TRADES                                                             */
      /* ------------------------------------------------------------------------- */
      case 'get_recent_trades': {
        const summary = (resultObj?.summary as Record<string, unknown>) ?? {};
        const trades = Array.isArray(resultObj?.trades)
          ? (resultObj.trades as Array<{ id: number; price: number; qty: number; time: number; isBuyerMaker: boolean }>).slice(0, 3)
          : [];
        const buyRatio = typeof summary?.buyRatio === 'number' ? summary.buyRatio : 50;

        return (
          <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
            {/* Header / Pressure indicator */}
            <div className="flex items-center justify-between pb-1.5 border-b border-theme-border-subtle/50 text-[10px]">
              <span className="font-semibold uppercase tracking-wider text-theme-text-muted">
                {res.recentTrades}
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-theme-text-muted">{res.buyPressure}:</span>
                <span
                  className={`font-bold ${buyRatio >= 50 ? 'text-theme-status-success' : 'text-theme-status-danger'
                    }`}
                >
                  {buyRatio}%
                </span>
              </div>
            </div>

            {/* Compact Trades List */}
            {trades.length > 0 && (
              <div className="flex flex-col gap-1 font-mono text-[11px]">
                {trades.map((t, idx) => {
                  const isBuy = !t.isBuyerMaker;
                  return (
                    <div
                      key={t.id ?? `tr_${idx}`}
                      className="flex items-center justify-between px-1 py-0.5 rounded hover:bg-theme-bg-surface/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isBuy ? (
                          <ArrowUpRight className="size-3 text-theme-status-success shrink-0" />
                        ) : (
                          <ArrowDownRight className="size-3 text-theme-status-danger shrink-0" />
                        )}
                        <span
                          className={`font-semibold ${isBuy ? 'text-theme-status-success' : 'text-theme-status-danger'
                            }`}
                        >
                          {formatUsd(t.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="text-theme-text-secondary">{formatOrderQty(t.qty)}</span>
                        <span className="text-theme-text-muted">
                          {new Date(t.time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      /* ------------------------------------------------------------------------- */
      /* OPEN INTEREST                                                             */
      /* ------------------------------------------------------------------------- */
      case 'get_open_interest': {
        const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
        const openInterest =
          typeof data?.openInterest === 'number'
            ? data.openInterest
            : parseFloat(String(data?.openInterest ?? 0));
        const symbol = typeof data?.symbol === 'string' ? (data.symbol as string) : undefined;
        const time =
          typeof data?.time === 'number'
            ? new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '—';

        return (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-theme-brand-accent/10 text-theme-brand-accent border border-theme-brand-accent/20">
                {res.openInterest}
              </span>
              {symbol && <span className="text-xs font-mono font-bold text-theme-text-primary">{symbol}</span>}
            </div>
            <div className="flex items-baseline gap-3 text-[11px] font-mono">
              <div>
                <span className="text-[10px] text-theme-text-muted mr-1.5">{res.openInterestContracts}:</span>
                <span className="font-bold text-theme-text-primary">{formatOrderQty(openInterest)}</span>
              </div>
              <span className="text-[10px] text-theme-text-muted">{time}</span>
            </div>
          </div>
        );
      }

      /* ------------------------------------------------------------------------- */
      /* DEFAULT ACTION RESULT                                                     */
      /* ------------------------------------------------------------------------- */
      default: {
        return (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80 text-xs text-theme-text-secondary">
            <CheckCircle2 className="size-3.5 text-theme-brand-binance shrink-0" />
            <span className="font-medium">{res.actionSuccess}</span>
          </div>
        );
      }
    }
  };

  return (
    <div className="w-full max-w-lg transition-all duration-200">
      {renderContent()}
    </div>
  );
});