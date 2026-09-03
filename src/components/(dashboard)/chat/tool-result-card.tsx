'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Layers,
  BarChart3,
  Activity,
  Wallet,
  ArrowRightLeft,
  XCircle,
  Sparkles,
  Code,
  AlertCircle,
  ChevronDown,
  ChevronUp,
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

interface ToolResultCardProps {
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
}

/**
 * Organizes tool results into human-friendly, structured cards with an optional raw JSON view.
 */
export function ToolResultCard({
  toolName,
  toolArgs,
  toolResult,
}: ToolResultCardProps) {
  const [showRaw, setShowRaw] = useState<boolean>(false);
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
          <div className="flex flex-wrap items-center gap-spacing-sm p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle">
            {symbol && (
              <span className="px-spacing-xs py-0.5 rounded text-2xs font-semibold bg-theme-bg-overlay text-white">
                {symbol}
              </span>
            )}
            <div className="flex items-baseline gap-spacing-xs">
              <span className="text-2xs text-theme-text-muted">{res.livePrice}:</span>
              <span className="text-xs font-bold text-theme-text-primary">
                {formatUsd(price)}
              </span>
            </div>
          </div>
        );
      }

      case 'get_order_book': {
        const summary = (resultObj?.summary as Record<string, unknown>) ?? {};
        const bids = Array.isArray(resultObj?.bids) ? (resultObj.bids as Array<[number, number]>).slice(0, 3) : [];
        const asks = Array.isArray(resultObj?.asks) ? (resultObj.asks as Array<[number, number]>).slice(0, 3) : [];

        return (
          <div className="flex flex-col gap-spacing-xs p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-spacing-xs text-2xs">
              <div className="flex flex-col">
                <span className="text-theme-text-muted">{res.bestBid}</span>
                <span className="font-semibold text-theme-status-success">{formatUsd(summary.bestBid)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-theme-text-muted">{res.bestAsk}</span>
                <span className="font-semibold text-theme-status-danger">{formatUsd(summary.bestAsk)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-theme-text-muted">{res.spread}</span>
                <span className="font-semibold text-theme-text-primary">
                  {formatUsd(summary.spread)} ({String(summary.spreadPercent ?? 0)}%)
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-theme-text-muted">{res.depthImbalance}</span>
                <span className="font-semibold text-theme-text-secondary">{String(summary.depthImbalanceRatio ?? '1.0')}</span>
              </div>
            </div>

            {/* Compact Mini Depth Table */}
            {(bids.length > 0 || asks.length > 0) && (
              <div className="grid grid-cols-2 gap-spacing-sm pt-spacing-xs border-t border-theme-border-subtle text-2xs font-mono">
                {/* Bids Column */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-theme-status-success font-medium text-[10px]">{res.topBids}</span>
                  {bids.map(([p, q], i) => (
                    <div key={`bid_${i}`} className="flex justify-between items-center text-theme-text-secondary">
                      <span>{formatUsd(p)}</span>
                      <span className="text-theme-text-muted">{q.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Asks Column */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-theme-status-danger font-medium text-[10px]">{res.topAsks}</span>
                  {asks.map(([p, q], i) => (
                    <div key={`ask_${i}`} className="flex justify-between items-center text-theme-text-secondary">
                      <span>{formatUsd(p)}</span>
                      <span className="text-theme-text-muted">{q.toFixed(2)}</span>
                    </div>
                  ))}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-spacing-xs p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle text-2xs">
            <div className="flex flex-col">
              <span className="text-theme-text-muted">{res.change24h}</span>
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
              <span className="text-theme-text-muted">{res.high24h}</span>
              <span className="font-semibold text-theme-text-primary">{formatUsd(data?.highPrice)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-theme-text-muted">{res.low24h}</span>
              <span className="font-semibold text-theme-text-primary">{formatUsd(data?.lowPrice)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-theme-text-muted">{res.volume24h}</span>
              <span className="font-semibold text-theme-text-secondary">{formatUsd(data?.volumeQuote)}</span>
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

      default: {
        return (
          <div className="p-spacing-xs rounded-md bg-theme-bg-elevated border border-theme-border-subtle text-2xs text-theme-text-secondary">
            <span>{JSON.stringify(resultObj ?? toolResult)}</span>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full max-w-xl">
      {/* Formatted Natural Result View */}
      {renderContent()}

      {/* Raw Data Toggle for Transparency */}
      <div className="flex items-center justify-between pt-0.5">
        <button
          type="button"
          onClick={() => setShowRaw((prev) => !prev)}
          className="inline-flex items-center gap-1 text-[10px] text-theme-text-muted hover:text-theme-text-primary transition-colors cursor-pointer select-none"
        >
          <Code className="size-2.5" />
          <span>{showRaw ? res.rawToggleHide : res.rawToggleShow}</span>
          {showRaw ? <ChevronUp className="size-2.5" /> : <ChevronDown className="size-2.5" />}
        </button>
      </div>

      {/* Expandable Raw JSON Drawer */}
      {showRaw && (
        <div className="p-spacing-xs rounded bg-theme-bg-surface border border-theme-border-subtle font-mono text-[10px] leading-relaxed text-theme-text-secondary max-h-40 overflow-y-auto whitespace-pre-wrap select-text">
          {Boolean(toolArgs) && (
            <div className="mb-1">
              <span className="text-theme-text-muted uppercase block">{APP_CONTENT.process.toolArgumentsLabel}</span>
              {JSON.stringify(toolArgs, null, 2)}
            </div>
          )}
          {Boolean(toolResult) && (
            <div>
              <span className="text-theme-text-muted uppercase block">{APP_CONTENT.process.toolResultLabel}</span>
              {JSON.stringify(toolResult, null, 2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
