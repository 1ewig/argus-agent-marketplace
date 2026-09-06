'use client';

import React, { useMemo } from 'react';
import {
  Scale,
  Layers,
  Gauge,
  Crosshair,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export interface MarketIntelligencePayload {
  control: {
    side: 'buyers' | 'sellers' | 'neutral';
    imbalance: number;
    summary: string;
  };
  levels: {
    support: number;
    resistance: number;
    bias: 'bullish' | 'bearish' | 'neutral';
    summary: string;
  };
  positioning: {
    fundingBias: 'longs_paying' | 'shorts_paying' | 'neutral';
    sentiment: 'bullish' | 'mildly_bullish' | 'neutral' | 'mildly_bearish' | 'bearish';
    summary: string;
  };
  playbook: {
    target: number;
    invalidation: number;
    bias: 'dip_buyer' | 'breakout' | 'range_scalp' | 'risk_off';
    summary: string;
  };
}

interface MarketIntelligenceAgentViewProps {
  symbol: string;
}

export function MarketIntelligenceAgentView({ symbol }: MarketIntelligenceAgentViewProps) {
  const content = APP_CONTENT.marketIntelligence;
  const cleanSymbol = symbol.trim().toUpperCase();

  // 1 Structured JSON Output (Tailored dynamically by symbol)
  const structuredData: MarketIntelligencePayload = useMemo(() => {
    if (cleanSymbol.startsWith('BTC')) {
      return {
        control: {
          side: 'buyers',
          imbalance: 1.42,
          summary: 'Buyers in control with strong bid support across top 20 depth levels',
        },
        levels: {
          support: 92450.0,
          resistance: 95800.0,
          bias: 'bullish',
          summary: 'Holding above 92,450 pivot, next major resistance at 95,800',
        },
        positioning: {
          fundingBias: 'longs_paying',
          sentiment: 'mildly_bullish',
          summary: 'Retail long, whales neutral, funding positive but well within safe baseline',
        },
        playbook: {
          target: 95800.0,
          invalidation: 91800.0,
          bias: 'dip_buyer',
          summary: 'Favorable risk/reward on pullbacks toward 92,450 support with 95,800 primary target',
        },
      };
    }

    if (cleanSymbol.startsWith('SOL')) {
      return {
        control: {
          side: 'buyers',
          imbalance: 1.31,
          summary: 'Buyers in control with firm bid volume defending local range low',
        },
        levels: {
          support: 182.5,
          resistance: 196.0,
          bias: 'bullish',
          summary: 'Holding above 182.50, next resistance test at 196.00',
        },
        positioning: {
          fundingBias: 'longs_paying',
          sentiment: 'mildly_bullish',
          summary: 'Long positioning steady, funding rates balanced across perpetual desks',
        },
        playbook: {
          target: 196.0,
          invalidation: 178.0,
          bias: 'dip_buyer',
          summary: 'Look for liquidity sweeps toward 182.50 to build longs targeting 196.00',
        },
      };
    }

    // Default / ETH / other pairs
    return {
      control: {
        side: 'buyers',
        imbalance: 1.38,
        summary: 'Buyers in control with strong bid support',
      },
      levels: {
        support: 2482.0,
        resistance: 2518.0,
        bias: 'bullish',
        summary: 'Holding above 2482, next resistance at 2518',
      },
      positioning: {
        fundingBias: 'longs_paying',
        sentiment: 'mildly_bullish',
        summary: 'Retail long, whales neutral, funding positive but mild',
      },
      playbook: {
        target: 2518.0,
        invalidation: 2450.0,
        bias: 'dip_buyer',
        summary: 'Favorable risk/reward on pullbacks toward 2482 support while buyer imbalance holds',
      },
    };
  }, [cleanSymbol]);

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 select-none">
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
            <span className="text-xs font-bold font-mono text-theme-status-success">
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
