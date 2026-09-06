'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Scale,
  Layers,
  Gauge,
  Crosshair,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { MarketIntelligencePayload, MarketIntelligenceResponse } from '@/agent';

export const ONE_HOUR_MS = 60 * 60 * 1000;

export function getStoredIntelligence(symbol: string): MarketIntelligenceResponse | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`argus_intel_${symbol.trim().toUpperCase()}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MarketIntelligenceResponse;
    if (parsed && typeof parsed.timestamp === 'number' && Date.now() - parsed.timestamp < ONE_HOUR_MS) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredIntelligence(symbol: string, data: MarketIntelligenceResponse) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`argus_intel_${symbol.trim().toUpperCase()}`, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

const subscribeMinuteTimer = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const timer = setInterval(callback, 30_000);
  return () => clearInterval(timer);
};

export function useIsFresh(timestamp?: number, thresholdMs: number = ONE_HOUR_MS): boolean {
  return React.useSyncExternalStore(
    subscribeMinuteTimer,
    () => (timestamp ? Date.now() - timestamp < thresholdMs : false),
    () => false
  );
}

interface MarketIntelligenceAgentViewProps {
  symbol: string;
}

export function MarketIntelligenceAgentView({ symbol }: MarketIntelligenceAgentViewProps) {
  const content = APP_CONTENT.marketIntelligence;
  const cleanSymbol = symbol.trim().toUpperCase();

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<MarketIntelligenceResponse>({
    queryKey: ['market-intelligence', cleanSymbol],
    queryFn: async () => {
      const res = await fetch('/api/agent/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: cleanSymbol }),
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch market intelligence (${res.status})`);
      }
      const data: MarketIntelligenceResponse = await res.json();
      setStoredIntelligence(cleanSymbol, data);
      return data;
    },
    initialData: () => getStoredIntelligence(cleanSymbol) ?? undefined,
    initialDataUpdatedAt: () => getStoredIntelligence(cleanSymbol)?.timestamp,
    staleTime: ONE_HOUR_MS,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const structuredData: MarketIntelligencePayload | undefined = response?.data;
  const newsCount = response?.newsCount ?? 0;
  const isCached = useIsFresh(response?.timestamp, ONE_HOUR_MS);

  const lastUpdatedTime = response?.timestamp
    ? new Date(response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3.5 sm:gap-4 select-none animate-pulse">
        {/* Skeleton Header Notice */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-theme-brand-binance animate-spin" />
            <span className="text-xs font-bold text-theme-text-primary">
              {content.scanningTitle}
            </span>
          </div>
          <span className="text-[10px] font-mono text-theme-text-muted">
            {content.statusRunning}
          </span>
        </div>

        {/* 4 Skeleton Card Placeholders */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5"
          >
            <div className="h-4 w-28 bg-theme-bg-elevated rounded" />
            <div className="h-10 w-full bg-theme-bg-elevated/60 rounded-lg" />
            <div className="h-3 w-3/4 bg-theme-bg-elevated/40 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // 2. Error State with Retry
  if (isError || !structuredData) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs gap-3">
        <div className="size-10 rounded-xl bg-theme-status-danger/10 text-theme-status-danger flex items-center justify-center">
          <AlertCircle className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold text-theme-text-primary">
            {content.errorTitle}
          </h4>
          <p className="text-xs text-theme-text-secondary max-w-xs leading-relaxed">
            {content.errorSubtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-theme-brand-binance text-theme-bg-overlay hover:brightness-105 active:brightness-95 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className="size-3" />
          <span>{content.retryButton}</span>
        </button>
      </div>
    );
  }

  // 3. Render Grounded 4-Card Executive Market Intelligence
  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 select-none">
      {/* Sentinel Status Banner & Web News Radar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-theme-bg-elevated/50 border border-theme-border-subtle/80">
        <div className="flex items-center gap-2">
          <Radio className="size-3.5 text-theme-status-success animate-pulse" />
          <span className="text-[11px] font-bold font-mono tracking-tight text-theme-text-primary" title={isCached ? content.cachedTooltip : undefined}>
            {isCached ? content.cachedBadge : content.statusLive}
          </span>
          {isFetching && (
            <RefreshCw className="size-2.5 text-theme-brand-binance animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-brand-binance/10 border border-theme-brand-binance/20 text-[10px] font-mono font-bold text-theme-brand-binance">
            <span>
              {newsCount > 0
                ? content.catalystsDetected(newsCount)
                : content.noCatalystsDetected}
            </span>
          </div>
          {lastUpdatedTime && (
            <span className="text-[10px] font-mono text-theme-text-muted">
              {lastUpdatedTime}
            </span>
          )}
        </div>
      </div>

      {/* 1. CARD 1: CONTROL */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Scale className="size-3.5 text-theme-brand-binance" />
            <span className="text-xs font-bold text-theme-text-primary tracking-wide uppercase">
              {content.controlCard.title}
            </span>
          </div>
        </div>

        {/* Hero Control Stance */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
          <div className="flex items-center gap-2">
            {structuredData.control.side === 'buyers' ? (
              <div className="size-6 rounded-full bg-theme-status-success/15 text-theme-status-success flex items-center justify-center shrink-0">
                <TrendingUp className="size-3.5" />
              </div>
            ) : structuredData.control.side === 'sellers' ? (
              <div className="size-6 rounded-full bg-theme-status-danger/15 text-theme-status-danger flex items-center justify-center shrink-0">
                <TrendingDown className="size-3.5" />
              </div>
            ) : (
              <div className="size-6 rounded-full bg-theme-text-muted/15 text-theme-text-muted flex items-center justify-center shrink-0">
                <Minus className="size-3.5" />
              </div>
            )}
            <span className="text-xs sm:text-sm font-bold text-theme-text-primary">
              {structuredData.control.side === 'buyers'
                ? content.controlCard.buyersLabel
                : structuredData.control.side === 'sellers'
                ? content.controlCard.sellersLabel
                : content.controlCard.neutralLabel}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-bg-surface border border-theme-border-subtle font-mono text-2xs font-bold text-theme-brand-binance">
            <span>{content.controlCard.imbalanceLabel}</span>
            <span>{structuredData.control.imbalance}x</span>
          </div>
        </div>

        {/* Summary Takeaway */}
        <p className="text-xs text-theme-text-secondary leading-relaxed pt-0.5">
          {structuredData.control.summary}
        </p>
      </div>

      {/* 2. CARD 2: KEY LEVELS */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="size-3.5 text-theme-brand-binance" />
            <span className="text-xs font-bold text-theme-text-primary tracking-wide uppercase">
              {content.levelsCard.title}
            </span>
          </div>
        </div>

        {/* Levels Grid (Support & Resistance) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Support */}
          <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-status-success/20">
            <span className="text-[10px] font-mono font-semibold uppercase text-theme-status-success">
              {content.levelsCard.supportLabel}
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-theme-text-primary tracking-tight">
              ${structuredData.levels.support.toLocaleString('en-US')}
            </span>
          </div>

          {/* Resistance */}
          <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-status-danger/20">
            <span className="text-[10px] font-mono font-semibold uppercase text-theme-status-danger">
              {content.levelsCard.resistanceLabel}
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-theme-text-primary tracking-tight">
              ${structuredData.levels.resistance.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* Bias Pill & Summary */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-theme-border-subtle/50 text-xs">
          <span className="text-theme-text-secondary leading-relaxed">
            {structuredData.levels.summary}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-2xs font-mono font-bold shrink-0 ${
              structuredData.levels.bias === 'bullish'
                ? 'bg-theme-status-success/15 text-theme-status-success border border-theme-status-success/30'
                : structuredData.levels.bias === 'bearish'
                ? 'bg-theme-status-danger/15 text-theme-status-danger border border-theme-status-danger/30'
                : 'bg-theme-bg-elevated text-theme-text-secondary border border-theme-border-subtle'
            }`}
          >
            {content.levelsCard.biasPrefix}{' '}
            {structuredData.levels.bias === 'bullish'
              ? content.levelsCard.biasBullish
              : structuredData.levels.bias === 'bearish'
              ? content.levelsCard.biasBearish
              : content.levelsCard.biasNeutral}
          </span>
        </div>
      </div>

      {/* 3. CARD 3: POSITIONING */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Gauge className="size-3.5 text-theme-brand-binance" />
            <span className="text-xs font-bold text-theme-text-primary tracking-wide uppercase">
              {content.positioningCard.title}
            </span>
          </div>
        </div>

        {/* Stance Indicators */}
        <div className="grid grid-cols-2 gap-2">
          {/* Funding Bias */}
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
            <span className="text-[10px] font-mono font-semibold uppercase text-theme-text-muted">
              Funding
            </span>
            <span className="text-xs font-bold font-mono text-theme-text-primary">
              {structuredData.positioning.fundingBias === 'longs_paying'
                ? content.positioningCard.fundingLongs
                : structuredData.positioning.fundingBias === 'shorts_paying'
                ? content.positioningCard.fundingShorts
                : content.positioningCard.fundingNeutral}
            </span>
          </div>

          {/* Sentiment */}
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80">
            <span className="text-[10px] font-mono font-semibold uppercase text-theme-text-muted">
              Sentiment
            </span>
            <span
              className={`text-xs font-bold font-mono ${
                structuredData.positioning.sentiment.includes('bullish')
                  ? 'text-theme-status-success'
                  : structuredData.positioning.sentiment.includes('bearish')
                  ? 'text-theme-status-danger'
                  : 'text-theme-text-secondary'
              }`}
            >
              {structuredData.positioning.sentiment === 'mildly_bullish'
                ? content.positioningCard.sentimentMildlyBullish
                : structuredData.positioning.sentiment === 'bullish'
                ? content.positioningCard.sentimentBullish
                : structuredData.positioning.sentiment === 'mildly_bearish'
                ? content.positioningCard.sentimentMildlyBearish
                : structuredData.positioning.sentiment === 'bearish'
                ? content.positioningCard.sentimentBearish
                : content.positioningCard.sentimentNeutral}
            </span>
          </div>
        </div>

        {/* Positioning Summary */}
        <p className="text-xs text-theme-text-secondary leading-relaxed pt-0.5">
          {structuredData.positioning.summary}
        </p>
      </div>

      {/* 4. CARD 4: TACTICAL PLAYBOOK */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Crosshair className="size-3.5 text-theme-brand-binance" />
            <span className="text-xs font-bold text-theme-text-primary tracking-wide uppercase">
              {content.playbookCard.title}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-theme-brand-binance/10 text-theme-brand-binance border border-theme-brand-binance/25">
            {structuredData.playbook.bias === 'dip_buyer'
              ? content.playbookCard.biases.dip_buyer
              : structuredData.playbook.bias === 'breakout'
              ? content.playbookCard.biases.breakout
              : structuredData.playbook.bias === 'range_scalp'
              ? content.playbookCard.biases.range_scalp
              : content.playbookCard.biases.risk_off}
          </span>
        </div>

        {/* Target vs Invalidation Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Target */}
          <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle">
            <span className="text-[10px] font-mono font-semibold uppercase text-theme-status-success">
              {content.playbookCard.targetLabel}
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-theme-text-primary tracking-tight">
              ${structuredData.playbook.target.toLocaleString('en-US')}
            </span>
          </div>

          {/* Invalidation */}
          <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle">
            <span className="text-[10px] font-mono font-semibold uppercase text-theme-status-danger">
              {content.playbookCard.invalidationLabel}
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-theme-text-primary tracking-tight">
              ${structuredData.playbook.invalidation.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* Playbook Summary */}
        <p className="text-xs text-theme-text-secondary leading-relaxed pt-0.5">
          {structuredData.playbook.summary}
        </p>
      </div>
    </div>
  );
}
