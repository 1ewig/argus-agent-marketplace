'use client';

import React from 'react';
import { Gauge, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { LiveFuturesFundingData } from '@/lib/binance-websocket';

interface FuturesFundingCardProps {
  data: LiveFuturesFundingData | null;
  isAvailable?: boolean;
  countdownFormatted?: string;
}

export const FuturesFundingCard = React.memo(function FuturesFundingCard({
  data,
  isAvailable = true,
  countdownFormatted = '--:--:--',
}: FuturesFundingCardProps) {
  const content = APP_CONTENT.marketPanel;

  const isPositiveFunding = (data?.fundingRate ?? 0) > 0;
  const isNegativeFunding = (data?.fundingRate ?? 0) < 0;

  return (
    <div className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs">
      {/* Top Header: Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Gauge className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs sm:text-sm font-bold text-theme-text-primary tracking-wide">
            {content.futuresTitle}
          </span>
          <span className="text-2xs font-mono font-bold text-theme-brand-binance bg-theme-brand-binance/10 border border-theme-brand-binance/25 px-1.5 py-0.5 rounded">
            {content.futuresBadge}
          </span>
        </div>
      </div>

      {!isAvailable ? (
        /* Graceful Spot-only fallback notice */
        <div className="flex items-center gap-2 p-3 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle text-xs text-theme-text-secondary font-mono">
          <AlertCircle className="size-4 text-theme-text-muted shrink-0" />
          <span>{content.futuresNotAvailable}</span>
        </div>
      ) : data ? (
        <>
          {/* Main Sentinel Grid: Funding Rate & Countdown */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Funding Rate Box */}
            <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/70">
              <span className="text-[11px] font-mono font-semibold text-theme-text-muted uppercase">
                {content.fundingRateLabel}
              </span>

              <div className="flex items-baseline gap-1">
                <span
                  className={`text-base sm:text-lg font-black font-mono tracking-tight ${
                    isPositiveFunding
                      ? 'text-theme-status-success'
                      : isNegativeFunding
                      ? 'text-theme-status-danger'
                      : 'text-theme-text-primary'
                  }`}
                >
                  {isPositiveFunding ? '+' : ''}
                  {data.fundingRatePercent.toFixed(4)}%
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-theme-text-muted pt-0.5">
                <span>
                  {isPositiveFunding
                    ? content.longsPayShorts
                    : isNegativeFunding
                    ? content.shortsPayLongs
                    : content.neutralFunding}
                </span>
              </div>
            </div>

            {/* Next Settlement Countdown Box */}
            <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/70">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-theme-text-muted uppercase">
                  {content.fundingCountdownLabel}
                </span>
                <Clock className="size-3 text-theme-brand-binance animate-pulse" />
              </div>

              <span className="text-base sm:text-lg font-black font-mono tracking-tight text-theme-text-primary">
                {countdownFormatted}
              </span>

              <div className="flex items-center justify-between text-[10px] font-mono text-theme-text-muted pt-0.5">
                <span>{content.fundingAprLabel}:</span>
                <span
                  className={`font-bold ${
                    data.annualizedApr >= 0 ? 'text-theme-status-success' : 'text-theme-status-danger'
                  }`}
                >
                  {data.annualizedApr >= 0 ? '+' : ''}
                  {data.annualizedApr.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Mark vs Index Price & Basis Spread Footprint */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-theme-border-subtle/50 text-2xs font-mono">
            <div className="flex flex-col">
              <span className="text-theme-text-muted uppercase font-semibold">
                {content.markPriceLabel}
              </span>
              <span className="text-theme-text-primary font-bold mt-0.5">
                $
                {data.markPrice.toLocaleString('en-US', {
                  minimumFractionDigits: data.precision,
                  maximumFractionDigits: data.precision,
                })}
              </span>
            </div>

            <div className="flex flex-col text-center">
              <span className="text-theme-text-muted uppercase font-semibold">
                {content.indexPriceLabel}
              </span>
              <span className="text-theme-text-secondary font-bold mt-0.5">
                $
                {data.indexPrice.toLocaleString('en-US', {
                  minimumFractionDigits: data.precision,
                  maximumFractionDigits: data.precision,
                })}
              </span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-theme-text-muted uppercase font-semibold">
                {content.basisSpreadLabel}
              </span>
              <span
                className={`font-bold mt-0.5 ${
                  data.basis >= 0 ? 'text-theme-status-success' : 'text-theme-status-danger'
                }`}
              >
                {data.basis >= 0 ? '+' : ''}
                {data.basisPercent.toFixed(3)}%
              </span>
            </div>
          </div>
        </>
      ) : (
        /* Loading Skeleton */
        <div className="flex flex-col gap-2.5 py-1 animate-pulse">
          <div className="grid grid-cols-2 gap-2">
            <div className="h-14 rounded-lg bg-theme-bg-elevated" />
            <div className="h-14 rounded-lg bg-theme-bg-elevated" />
          </div>
          <div className="flex justify-between text-2xs font-mono text-theme-text-muted pt-1">
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin text-theme-brand-binance" />
              {content.loadingFutures}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

FuturesFundingCard.displayName = 'FuturesFundingCard';
