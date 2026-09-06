'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Layers,
  RefreshCw,
  Scale,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';

interface MarketDataAgentViewProps {
  symbol: string;
}

export function MarketDataAgentView({ symbol }: MarketDataAgentViewProps) {
  const content = APP_CONTENT.subAgents.marketData;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('Just now');

  const cleanSymbol = symbol.toUpperCase();

  // Dynamic sample mock schema tailored to active symbol
  const structuredData = useMemo(() => {
    return {
      agent: 'Market Data Agent',
      version: '1.0.0',
      symbol: cleanSymbol,
      timestamp: new Date().toISOString(),
      stance: {
        bias: content.mockValues.bias,
        confidenceScore: content.mockValues.confidence,
        volatilityLevel: content.mockValues.volatility,
        liquidityScore: content.mockValues.liquidity,
      },
      microstructure: {
        bidAskRatio: content.mockValues.depthImbalance,
        bidDepthPercent: content.mockValues.bidRatio,
        askDepthPercent: content.mockValues.askRatio,
        spreadUsd: content.mockValues.spreadUsd,
        spreadBps: content.mockValues.spreadBps,
      },
      flowAndVwap: {
        vwapDeviation: content.mockValues.vwapDev,
        vwapStatus: 'PREMIUM',
        takerBuyPercent: content.mockValues.takerBuyPercent,
        takerSellPercent: content.mockValues.takerSellPercent,
      },
      keyLevels: {
        support: cleanSymbol.startsWith('BTC') ? 91200 : cleanSymbol.startsWith('ETH') ? 2640 : 142.5,
        pivot: cleanSymbol.startsWith('BTC') ? 92850 : cleanSymbol.startsWith('ETH') ? 2710 : 146.2,
        resistance: cleanSymbol.startsWith('BTC') ? 94500 : cleanSymbol.startsWith('ETH') ? 2795 : 151.0,
      },
      analyticalTakeaway: content.mockValues.takeaway(cleanSymbol),
    };
  }, [cleanSymbol, content.mockValues]);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      setLastUpdatedTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      );
    }, 600);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(structuredData, null, 2));
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 select-none">
      {/* 1. Agent Identity & Personality Header Card */}
      <div className="p-3.5 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs relative overflow-hidden">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-theme-brand-binance/10 border border-theme-brand-binance/30 flex items-center justify-center text-theme-brand-binance shrink-0">
              <Bot className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-theme-text-primary tracking-tight">
                  {content.name}
                </span>
                <span className="px-1.5 py-0.5 rounded-xs bg-theme-bg-elevated border border-theme-border-subtle text-[10px] font-mono font-bold text-theme-brand-binance">
                  {APP_CONTENT.subAgents.agentBadgeNum}
                </span>
              </div>
              <p className="text-[11px] text-theme-text-secondary leading-tight mt-0.5">
                {content.personality}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border bg-theme-status-success/10 border-theme-status-success/30 text-theme-status-success shrink-0">
            <span className="size-1.5 rounded-full bg-theme-status-success animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-tight">
              {content.statusReady}
            </span>
          </div>
        </div>

        {/* Action Trigger Bar */}
        <div className="flex items-center justify-between pt-2.5 border-t border-theme-border-subtle/70">
          <span className="text-[10px] font-mono text-theme-text-muted">
            {content.lastUpdated(lastUpdatedTime)}
          </span>
          <motion.button
            type="button"
            whileTap={tapScalePill}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 border border-theme-border-subtle text-theme-text-primary hover:text-theme-brand-binance text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`size-3 text-theme-brand-binance ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className="text-[11px] font-medium">
              {isRefreshing ? content.refreshing : content.refreshButton}
            </span>
          </motion.button>
        </div>
      </div>

      {/* 2. Primary Stance & Quant Confluence Score */}
      <div className="p-3.5 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-theme-text-secondary">
            {content.metrics.biasLabel}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-theme-status-success/10 border border-theme-status-success/30 text-theme-status-success">
            <TrendingUp className="size-3" />
            <span className="text-xs font-extrabold tracking-wide">
              {structuredData.stance.bias}
            </span>
          </div>
        </div>

        {/* Confidence & Liquidity Dual Gauge */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Quant Confidence */}
          <div className="p-2.5 rounded-lg bg-theme-bg-elevated/50 border border-theme-border-subtle flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-theme-text-secondary">
              <span>{content.metrics.confidenceLabel}</span>
              <Zap className="size-3 text-theme-brand-binance" />
            </div>
            <span className="text-lg font-mono font-extrabold text-theme-text-primary">
              {structuredData.stance.confidenceScore}%
            </span>
            <div className="w-full h-1.5 bg-theme-bg-surface rounded-full overflow-hidden border border-theme-border-subtle">
              <div
                className="h-full bg-theme-brand-binance rounded-full transition-all duration-500"
                style={{ width: `${structuredData.stance.confidenceScore}%` }}
              />
            </div>
          </div>

          {/* Liquidity Score */}
          <div className="p-2.5 rounded-lg bg-theme-bg-elevated/50 border border-theme-border-subtle flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-theme-text-secondary">
              <span>{content.metrics.liquidityLabel}</span>
              <ShieldCheck className="size-3 text-theme-status-success" />
            </div>
            <span className="text-lg font-mono font-extrabold text-theme-text-primary">
              {structuredData.stance.liquidityScore}
              <span className="text-xs text-theme-text-muted font-normal">/100</span>
            </span>
            <div className="w-full h-1.5 bg-theme-bg-surface rounded-full overflow-hidden border border-theme-border-subtle">
              <div
                className="h-full bg-theme-status-success rounded-full transition-all duration-500"
                style={{ width: `${structuredData.stance.liquidityScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Microstructure: Order Book Imbalance & Spread */}
      <div className="p-3.5 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-theme-text-primary">
            <Scale className="size-3.5 text-theme-brand-binance" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {content.metrics.orderBookTitle}
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-theme-status-success">
            {structuredData.microstructure.bidAskRatio} Bid Heavy
          </span>
        </div>

        {/* Visual Bid / Ask Imbalance Bar */}
        <div className="flex flex-col gap-1">
          <div className="w-full h-3 rounded-full overflow-hidden flex border border-theme-border-subtle bg-theme-bg-elevated">
            <div
              className="h-full bg-theme-status-success/80 transition-all duration-500 flex items-center justify-start pl-1"
              style={{ width: `${structuredData.microstructure.bidDepthPercent}%` }}
            />
            <div
              className="h-full bg-theme-status-danger/80 transition-all duration-500 flex items-center justify-end pr-1"
              style={{ width: `${structuredData.microstructure.askDepthPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono font-medium text-theme-text-muted px-0.5">
            <span className="text-theme-status-success">
              {structuredData.microstructure.bidDepthPercent}% {content.metrics.bidVolumeLabel}
            </span>
            <span className="text-theme-status-danger">
              {structuredData.microstructure.askDepthPercent}% {content.metrics.askVolumeLabel}
            </span>
          </div>
        </div>

        {/* Spread Matrix */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80 text-[11px]">
          <span className="text-theme-text-secondary">{content.metrics.spreadLabel}</span>
          <div className="flex items-center gap-1.5 font-mono font-bold">
            <span className="text-theme-text-primary">
              ${structuredData.microstructure.spreadUsd}
            </span>
            <span className="text-theme-text-muted">
              ({structuredData.microstructure.spreadBps})
            </span>
            <span className="px-1.5 py-0.2 rounded-xs bg-theme-status-success/10 text-theme-status-success text-[10px]">
              {content.metrics.spreadRating}
            </span>
          </div>
        </div>
      </div>

      {/* 4. 5m VWAP Benchmark & Tape Flow */}
      <div className="p-3.5 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-theme-text-primary">
            <Activity className="size-3.5 text-theme-brand-binance" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {content.metrics.vwapBenchmarkTitle}
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-theme-status-success">
            {structuredData.flowAndVwap.vwapDeviation}
          </span>
        </div>

        {/* VWAP Status Pill */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle/80 text-[11px]">
          <span className="text-theme-text-secondary">{content.metrics.vwapDeviationLabel}</span>
          <div className="flex items-center gap-1 font-medium text-theme-status-success">
            <ArrowUpRight className="size-3 stroke-[2.5]" />
            <span>{content.metrics.vwapAbove}</span>
          </div>
        </div>

        {/* Taker Flow Aggression Bar */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-theme-text-secondary">{content.metrics.takerFlowLabel}</span>
            <span className="font-mono font-bold text-theme-status-success">
              {structuredData.flowAndVwap.takerBuyPercent}% Buy Flow
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden flex border border-theme-border-subtle bg-theme-bg-elevated">
            <div
              className="h-full bg-theme-status-success rounded-full transition-all duration-500"
              style={{ width: `${structuredData.flowAndVwap.takerBuyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Key Quant Levels */}
      <div className="p-3.5 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 text-theme-text-primary">
          <BarChart3 className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {content.metrics.keyLevelsTitle}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Support */}
          <div className="p-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-bold text-theme-text-muted">
              {content.metrics.supportLabel}
            </span>
            <span className="text-xs font-mono font-bold text-theme-status-success mt-0.5">
              ${structuredData.keyLevels.support.toLocaleString()}
            </span>
          </div>

          {/* Pivot */}
          <div className="p-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-bold text-theme-text-muted">
              {content.metrics.pivotLabel}
            </span>
            <span className="text-xs font-mono font-bold text-theme-text-primary mt-0.5">
              ${structuredData.keyLevels.pivot.toLocaleString()}
            </span>
          </div>

          {/* Resistance */}
          <div className="p-2 rounded-lg bg-theme-bg-elevated/40 border border-theme-border-subtle flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-bold text-theme-text-muted">
              {content.metrics.resistanceLabel}
            </span>
            <span className="text-xs font-mono font-bold text-theme-status-danger mt-0.5">
              ${structuredData.keyLevels.resistance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Analytical Takeaway Blockquote */}
      <div className="p-3.5 rounded-xl bg-theme-bg-surface border border-theme-border-subtle shadow-2xs flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-theme-text-primary">
          <Layers className="size-3.5 text-theme-brand-binance" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {content.metrics.synthesisTitle}
          </span>
        </div>
        <p className="text-xs text-theme-text-secondary leading-relaxed border-l-2 border-theme-brand-binance pl-2.5 py-0.5 italic">
          {structuredData.analyticalTakeaway}
        </p>
      </div>

      {/* 7. Unique Selling Point: Structured JSON Drawer */}
      <div className="p-3 rounded-xl bg-theme-bg-surface/80 border border-theme-border-subtle shadow-2xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Code2 className="size-3.5 text-theme-brand-binance" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-theme-text-primary">
              {content.metrics.jsonDrawerTitle}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.button
              type="button"
              whileTap={tapScalePill}
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 border border-theme-border-subtle text-theme-text-secondary hover:text-theme-text-primary text-[10px] font-mono transition-colors cursor-pointer"
            >
              {hasCopied ? (
                <>
                  <Check className="size-2.5 text-theme-status-success" />
                  <span className="text-theme-status-success">{content.metrics.copiedJson}</span>
                </>
              ) : (
                <>
                  <Copy className="size-2.5" />
                  <span>{content.metrics.copyJson}</span>
                </>
              )}
            </motion.button>
            <motion.button
              type="button"
              whileTap={tapScalePill}
              onClick={() => setIsJsonOpen(!isJsonOpen)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 border border-theme-border-subtle text-theme-text-secondary hover:text-theme-text-primary text-[10px] transition-colors cursor-pointer"
            >
              <span>{isJsonOpen ? content.metrics.hideJson : content.metrics.viewJson}</span>
              {isJsonOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </motion.button>
          </div>
        </div>

        <p className="text-[10px] text-theme-text-muted leading-tight">
          {content.metrics.jsonDrawerSubtitle}
        </p>

        <AnimatePresence>
          {isJsonOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <pre className="p-3 rounded-lg bg-theme-bg-overlay border border-theme-border-subtle text-[11px] font-mono text-theme-text-secondary overflow-x-auto custom-scrollbar max-h-56 leading-relaxed select-text">
                {JSON.stringify(structuredData, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
