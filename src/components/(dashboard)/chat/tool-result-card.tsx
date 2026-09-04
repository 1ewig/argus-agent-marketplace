'use client';

import React from 'react';
import {
  TrendingUp,
  Layers,
  BarChart3,
  Activity,
  Wallet,
  ArrowRightLeft,
  XCircle,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Percent,
  Calculator,
  History,
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
  const side = typeof toolArgs?.side === 'string' ? toolArgs.side.toUpperCase() : undefined;
  const quantity = typeof toolArgs?.quantity === 'number' ? toolArgs.quantity : undefined;

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
    case 'get_account_balance':
      return {
        title: labels.get_account_balance(),
        icon: Wallet,
        symbol,
      };
    case 'place_spot_order':
      return {
        title: labels.place_spot_order(symbol, side, quantity),
        icon: ArrowRightLeft,
        symbol,
      };
    case 'cancel_order':
      return {
        title: labels.cancel_order(symbol),
        icon: XCircle,
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
 * Formats numbers into clean currency and volume strings without external dependencies.
 */
function formatUsd(val: unknown): string {
  const num = typeof val === 'number' ? val : Number(val);
  if (Number.isNaN(num)) return '—';
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (num >= 1) return `$${num.toFixed(2)}`;
  return `$${num.toFixed(4)}`;
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
 * Formats asset order quantities with dynamic precision, preventing fractional truncation to 0.00.
 */
function formatOrderQty(val: unknown): string {
  const num = typeof val === 'number' ? val : Number(val);
  if (Number.isNaN(num)) return '—';
  if (num >= 1000) return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (num >= 10) return num.toFixed(2);
  if (num >= 1) return num.toFixed(3);
  if (num >= 0.0001) {
    return Number(num.toFixed(4)).toString();
  }
  return num.toString();
}

interface ToolResultCardProps {
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
}

/**
 * Organizes tool results into human-friendly, structured visual cards.
 */
export function ToolResultCard({
  toolName,
  toolArgs,
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
        <div className="flex items-center gap-spacing-xs p-spacing-xs rounded bg-theme-status-danger/10 border border-theme-status-danger/20 text-theme-status-danger text-2xs font-medium">
          <AlertCircle className="size-3 shrink-0" />
          <span>{errorMessage ?? res.errorTitle}</span>
        </div>
      );
    }

    if (!toolResult) {
      return (
        <span className="text-theme-text-muted text-2xs italic">
          {res.emptyResult}
        </span>
      );
    }

    switch (toolName) {
      case 'get_ticker_price': {
        const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
        const price = data?.price ?? resultObj?.price;
        const symbol = typeof data?.symbol === 'string' ? data.symbol : undefined;

        return (
          <div className="flex items-center justify-between p-3 rounded-xl bg-theme-bg-elevated/70 border border-theme-border-subtle shadow-2xs">
            <div className="flex flex-col">
              <span className="text-2xs font-extrabold uppercase tracking-widest text-theme-text-muted">
                {res.livePrice}
              </span>
              <div className="flex items-baseline gap-spacing-xs mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold font-mono text-theme-text-primary tracking-tight">
                  {formatUsd(price)}
                </span>
                <span className="text-2xs font-mono text-theme-text-muted">USD</span>
              </div>
            </div>
            {symbol && (
              <span className="px-spacing-sm py-1 rounded-lg text-xs font-bold bg-theme-bg-overlay text-theme-brand-binance border border-theme-border-strong shadow-2xs">
                {symbol}
              </span>
            )}
          </div>
        );
      }

      case 'get_order_book': {
        const summary = (resultObj?.summary as Record<string, unknown>) ?? {};
        const bids = Array.isArray(resultObj?.bids) ? (resultObj.bids as Array<[number, number]>).slice(0, 4) : [];
        const asks = Array.isArray(resultObj?.asks) ? (resultObj.asks as Array<[number, number]>).slice(0, 4) : [];

        const maxBidQty = Math.max(...bids.map(([, q]) => Number(q) || 0), 0.0001);
        const maxAskQty = Math.max(...asks.map(([, q]) => Number(q) || 0), 0.0001);

        return (
          <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-theme-bg-elevated/70 border border-theme-border-subtle shadow-2xs">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-spacing-xs p-2.5 rounded-lg bg-theme-bg-surface border border-theme-border-subtle text-2xs shadow-2xs">
              <div className="flex flex-col">
                <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">{res.bestBid}</span>
                <span className="text-sm font-extrabold font-mono text-theme-status-success">{formatUsd(summary.bestBid)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">{res.bestAsk}</span>
                <span className="text-sm font-extrabold font-mono text-theme-status-danger">{formatUsd(summary.bestAsk)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">{res.spread}</span>
                <span className="text-sm font-extrabold font-mono text-theme-text-primary">
                  {formatUsd(summary.spread)} <span className="text-2xs font-normal text-theme-brand-binance">({String(summary.spreadPercent ?? 0)}%)</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">{res.depthImbalance}</span>
                <span className="text-sm font-extrabold font-mono text-theme-text-secondary">{String(summary.depthImbalanceRatio ?? '1.0')}</span>
              </div>
            </div>

            {/* Segmented Depth Indicator Meter */}
            <div className="flex items-center gap-0.5 h-3 bg-theme-bg-surface p-0.5 rounded-md border border-theme-border-subtle">
              {Array.from({ length: 24 }).map((_, i) => {
                const isSpreadZone = i >= 10 && i <= 14;
                const isBidHeavy = i < 10;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-full rounded-xs transition-all ${
                      isSpreadZone
                        ? 'bg-theme-brand-binance'
                        : isBidHeavy
                        ? 'bg-theme-status-success/40'
                        : 'bg-theme-status-danger/40'
                    }`}
                  />
                );
              })}
            </div>

            {/* Split Order Book Depth Panels */}
            {(bids.length > 0 || asks.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
                {/* Bids Panel (Buy Side) */}
                <div className="flex flex-col rounded-lg bg-theme-bg-surface border border-theme-border-subtle overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between px-2.5 py-1 bg-theme-bg-elevated border-b border-theme-border-subtle">
                    <span className="font-extrabold text-theme-status-success uppercase tracking-wider text-2xs">
                      {res.topBids}
                    </span>
                    <span className="text-theme-text-muted font-mono text-2xs">
                      {res.priceHeader} / {res.sizeHeader}
                    </span>
                  </div>

                  <div className="flex flex-col p-1 font-mono">
                    {bids.map(([p, q], i) => {
                      const qty = Number(q) || 0;
                      const fillPercent = Math.min(100, Math.round((qty / maxBidQty) * 100));
                      return (
                        <div
                          key={`bid_${i}`}
                          className="relative flex justify-between items-center px-2 py-0.5 rounded-xs overflow-hidden hover:bg-theme-bg-elevated/40 transition-colors"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-theme-status-success/15 rounded-xs pointer-events-none"
                            style={{ width: `${fillPercent}%` }}
                          />
                          <span className="relative z-10 font-bold text-theme-status-success">
                            {formatUsd(p)}
                          </span>
                          <span className="relative z-10 text-theme-text-secondary font-medium">
                            {formatOrderQty(q)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Asks Panel (Sell Side) */}
                <div className="flex flex-col rounded-lg bg-theme-bg-surface border border-theme-border-subtle overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between px-2.5 py-1 bg-theme-bg-elevated border-b border-theme-border-subtle">
                    <span className="font-extrabold text-theme-status-danger uppercase tracking-wider text-2xs">
                      {res.topAsks}
                    </span>
                    <span className="text-theme-text-muted font-mono text-2xs">
                      {res.priceHeader} / {res.sizeHeader}
                    </span>
                  </div>

                  <div className="flex flex-col p-1 font-mono">
                    {asks.map(([p, q], i) => {
                      const qty = Number(q) || 0;
                      const fillPercent = Math.min(100, Math.round((qty / maxAskQty) * 100));
                      return (
                        <div
                          key={`ask_${i}`}
                          className="relative flex justify-between items-center px-2 py-0.5 rounded-xs overflow-hidden hover:bg-theme-bg-elevated/40 transition-colors"
                        >
                          <div
                            className="absolute inset-y-0 right-0 bg-theme-status-danger/15 rounded-xs pointer-events-none"
                            style={{ width: `${fillPercent}%` }}
                          />
                          <span className="relative z-10 font-bold text-theme-status-danger">
                            {formatUsd(p)}
                          </span>
                          <span className="relative z-10 text-theme-text-secondary font-medium">
                            {formatOrderQty(q)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'get_24h_stats': {
        const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
        const change = formatPercent(data?.priceChangePercent);

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-theme-bg-elevated/70 border border-theme-border-subtle text-2xs shadow-2xs">
            <div className="flex flex-col">
              <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">{res.change24h}</span>
              <span
                className={`text-base font-extrabold font-mono ${
                  change.isPositive
                    ? 'text-theme-status-success'
                    : change.isNegative
                    ? 'text-theme-status-danger'
                    : 'text-theme-text-primary'
                }`}
              >
                {change.text}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">{res.high24h}</span>
              <span className="text-xs font-bold font-mono text-theme-text-primary mt-0.5">{formatUsd(data?.highPrice)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">{res.low24h}</span>
              <span className="text-xs font-bold font-mono text-theme-text-primary mt-0.5">{formatUsd(data?.lowPrice)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">{res.volume24h}</span>
              <span className="text-xs font-bold font-mono text-theme-text-secondary mt-0.5">{formatUsd(data?.volumeQuote)}</span>
            </div>
          </div>
        );
      }

      case 'get_klines': {
        const change = formatPercent(resultObj?.periodChangePercent);

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-spacing-xs p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle text-2xs">
            <div className="flex flex-col">
              <span className="text-theme-text-muted">{res.timeframe}</span>
              <span className="font-bold text-theme-brand-binance">{String(resultObj?.interval ?? '15m')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-theme-text-muted">{res.periodChange}</span>
              <span
                className={`font-bold ${
                  change.isPositive
                    ? 'text-theme-status-success'
                    : change.isNegative
                    ? 'text-theme-status-danger'
                    : 'text-theme-text-primary'
                }`}
              >
                {change.text}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-theme-text-muted">{res.latestPrice}</span>
              <span className="font-semibold text-theme-text-primary">{formatUsd(resultObj?.latestPrice)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-theme-text-muted">{res.candlesCount}</span>
              <span className="font-semibold text-theme-text-secondary">{String(resultObj?.candleCount ?? '—')}</span>
            </div>
          </div>
        );
      }

      case 'get_funding_rate': {
        const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
        const rate = typeof data?.lastFundingRate === 'number' ? data.lastFundingRate : 0;
        const ratePct = +(rate * 100).toFixed(4);
        const apr = typeof data?.annualizedRatePercent === 'number' ? data.annualizedRatePercent : +(ratePct * 3 * 365).toFixed(2);
        const isPositive = rate > 0;
        const nextTime = typeof data?.nextFundingTime === 'number' ? new Date(data.nextFundingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-spacing-xs p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle text-2xs">
            <div className="flex flex-col">
              <span className="text-theme-text-muted">{res.fundingRate}</span>
              <span className={`font-bold ${isPositive ? 'text-theme-status-success' : rate < 0 ? 'text-theme-status-danger' : 'text-theme-text-primary'}`}>
                {rate > 0 ? `+${ratePct}%` : `${ratePct}%`}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-theme-text-muted">{res.annualizedRate}</span>
              <span className="font-semibold text-theme-brand-binance">{apr > 0 ? `+${apr}%` : `${apr}%`}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-theme-text-muted">{res.markPrice}</span>
              <span className="font-semibold text-theme-text-primary">{formatUsd(data?.markPrice)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-theme-text-muted">{res.nextFunding}</span>
              <span className="font-semibold text-theme-text-secondary">{nextTime}</span>
            </div>
          </div>
        );
      }

      case 'get_average_price': {
        const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
        const avgPrice = typeof data?.price === 'number' ? data.price : Number(data?.price);
        const mins = data?.mins ?? 5;

        return (
          <div className="flex flex-wrap items-center gap-spacing-sm p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle text-2xs">
            <span className="px-spacing-xs py-0.5 rounded font-bold uppercase bg-theme-brand-binance/15 text-theme-brand-binance">
              {String(mins)}m VWAP
            </span>
            <div className="flex items-baseline gap-spacing-xs">
              <span className="text-theme-text-muted">{res.averagePrice}:</span>
              <span className="text-xs font-bold text-theme-text-primary">
                {formatUsd(avgPrice)}
              </span>
            </div>
          </div>
        );
      }

      case 'get_recent_trades': {
        const summary = (resultObj?.summary as Record<string, unknown>) ?? {};
        const trades = Array.isArray(resultObj?.trades) ? (resultObj.trades as Array<{ id: number; price: number; qty: number; time: number; isBuyerMaker: boolean }>) : [];
        const buyRatio = typeof summary?.buyRatio === 'number' ? summary.buyRatio : 50;

        return (
          <div className="flex flex-col gap-spacing-xs p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle text-2xs">
            <div className="flex items-center justify-between px-1 py-0.5 border-b border-theme-border-subtle/50 text-2xs">
              <span className="font-semibold text-theme-text-secondary uppercase tracking-wider">
                {res.recentTrades}
              </span>
              <div className="flex items-center gap-spacing-xs">
                <span className="text-theme-text-muted">{res.buyPressure}:</span>
                <span className={`font-bold ${buyRatio >= 50 ? 'text-theme-status-success' : 'text-theme-status-danger'}`}>
                  {buyRatio}%
                </span>
              </div>
            </div>

            {trades.length > 0 && (
              <div className="flex flex-col gap-0.5 font-mono">
                {trades.slice(0, 5).map((t, idx) => {
                  const isBuy = !t.isBuyerMaker;
                  return (
                    <div key={t.id ?? `tr_${idx}`} className="flex justify-between items-center px-1.5 py-0.5 rounded-xs hover:bg-theme-bg-surface/50 text-2xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1 py-0.5 rounded-xs text-2xs font-bold ${isBuy ? 'bg-theme-status-success/15 text-theme-status-success' : 'bg-theme-status-danger/15 text-theme-status-danger'}`}>
                          {isBuy ? res.takerBuy : res.takerSell}
                        </span>
                        <span className={isBuy ? 'text-theme-status-success font-medium' : 'text-theme-status-danger font-medium'}>
                          {formatUsd(t.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-spacing-sm">
                        <span className="text-theme-text-secondary">{formatOrderQty(t.qty)}</span>
                        <span className="text-theme-text-muted text-2xs">
                          {new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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

      case 'get_account_balance': {
        const balances = Array.isArray(resultObj?.balances)
          ? (resultObj.balances as Array<{ asset: string; free: number; locked: number }>).filter(
              (b) => b.free > 0 || b.locked > 0
            )
          : [];

        if (balances.length === 0) {
          return (
            <div className="p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle text-2xs text-theme-text-muted">
              {res.noBalances}
            </div>
          );
        }

        return (
          <div className="flex flex-wrap gap-spacing-xs p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle">
            {balances.map((b) => (
              <div
                key={b.asset}
                className="flex items-center gap-spacing-xs px-spacing-xs py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle text-2xs"
              >
                <span className="font-bold text-theme-text-primary">{b.asset}</span>
                <span className="text-theme-text-secondary">
                  {b.free.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                </span>
                {b.locked > 0 && (
                  <span className="text-[10px] text-theme-text-muted">
                    ({b.locked} {res.lockedBalance})
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      }

      case 'place_spot_order': {
        const receipt = (resultObj?.receipt as Record<string, unknown>) ?? resultObj;
        const side = String(receipt?.side ?? 'BUY');
        const isBuy = side === 'BUY';

        return (
          <div className="flex flex-wrap items-center gap-spacing-sm p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle text-2xs">
            <span
              className={`px-spacing-xs py-0.5 rounded font-bold uppercase ${
                isBuy
                  ? 'bg-theme-status-success/15 text-theme-status-success'
                  : 'bg-theme-status-danger/15 text-theme-status-danger'
              }`}
            >
              {side} {String(receipt?.symbol ?? '')}
            </span>
            <span className="text-theme-text-muted">{res.orderStatus}:</span>
            <span className="font-semibold text-theme-text-primary">{String(receipt?.status ?? 'FILLED')}</span>
            <span className="text-theme-text-muted">•</span>
            <span className="text-theme-text-secondary">
              {String(receipt?.executedQty ?? '')} @ {formatUsd(receipt?.price)}
            </span>
          </div>
        );
      }

      case 'cancel_order': {
        const data = (resultObj?.data as Record<string, unknown>) ?? resultObj;
        const symbol = typeof toolArgs?.symbol === 'string' ? (toolArgs.symbol as string).toUpperCase() : undefined;
        const orderId = typeof data?.orderId === 'string' ? data.orderId : typeof toolArgs?.orderId === 'string' ? (toolArgs.orderId as string) : undefined;

        return (
          <div className="flex flex-wrap items-center gap-spacing-sm p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle text-2xs">
            <span className="px-spacing-xs py-0.5 rounded font-bold uppercase bg-theme-status-warning/15 text-theme-status-warning">
              {res.orderCanceled}
            </span>
            {symbol && (
              <span className="font-semibold text-theme-text-primary">{symbol}</span>
            )}
            {orderId && (
              <>
                <span className="text-theme-text-muted">•</span>
                <span className="text-theme-text-secondary">#{orderId}</span>
              </>
            )}
          </div>
        );
      }

      default: {
        return (
          <div className="flex items-center gap-spacing-xs p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle text-2xs text-theme-text-secondary">
            <CheckCircle2 className="size-3 text-theme-brand-binance shrink-0" />
            <span className="font-medium">{res.actionSuccess}</span>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full max-w-xl">
      {renderContent()}
    </div>
  );
}
