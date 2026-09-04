'use client';

import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export function DailyMarketCard() {
  const analysis = APP_CONTENT.cards.marketAnalysis;

  return (
    <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-2xl p-spacing-md shadow-xs flex flex-col justify-between gap-spacing-sm flex-1 min-h-0">
      {/* Card Header & Exa Web Search Ready Tag */}
      <div className="flex items-center justify-between">
        <span className="text-2xs font-bold text-theme-text-muted uppercase tracking-wider">
          {analysis.title}
        </span>
        <span className="flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full bg-theme-brand-binance/10 border border-theme-brand-binance/30 text-theme-brand-binance font-extrabold">
          <Sparkles className="size-2.5" />
          <span>{analysis.webSearchBadge}</span>
        </span>
      </div>

      {/* Geometric Sentiment Arcs Visual (matching the reference photo) */}
      <div className="relative flex items-center justify-between py-spacing-xs">
        {/* SVG Arc Geometry */}
        <div className="w-24 h-16 relative">
          <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
            {/* Outer Arc */}
            <path
              d="M 10 55 A 40 40 0 0 1 90 55"
              fill="none"
              stroke="var(--theme-border-subtle)"
              strokeWidth="2.5"
            />
            {/* Middle Arc */}
            <path
              d="M 25 55 A 25 25 0 0 1 75 55"
              fill="none"
              stroke="var(--theme-border-strong)"
              strokeWidth="2.5"
            />
            {/* Inner Active Arc */}
            <path
              d="M 38 55 A 12 12 0 0 1 62 55"
              fill="none"
              stroke="var(--theme-brand-binance)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Anchor Dots */}
            <circle cx="10" cy="55" r="2" fill="var(--theme-text-muted)" />
            <circle cx="90" cy="55" r="2" fill="var(--theme-text-muted)" />
            <circle cx="25" cy="55" r="2.5" fill="var(--theme-text-primary)" />
            <circle cx="75" cy="55" r="2.5" fill="var(--theme-text-primary)" />
            <circle cx="62" cy="55" r="3" fill="var(--theme-brand-binance)" />
          </svg>
        </div>

        {/* Sentiment Metric Score */}
        <div className="flex flex-col items-end">
          <span className="text-2xl font-extrabold text-theme-text-primary font-mono tracking-tight">
            {analysis.sentimentScore}
          </span>
          <div className="flex items-center gap-1 text-2xs text-theme-status-success font-bold">
            <Compass className="size-3" />
            <span>{analysis.sentimentLabel}</span>
          </div>
          <span className="text-2xs text-theme-text-muted">
            {analysis.sentimentSub}
          </span>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="p-spacing-xs px-spacing-sm rounded-lg bg-theme-bg-elevated border border-theme-border-subtle">
        <p className="text-2xs text-theme-text-secondary leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Bottom Key Levels Pill */}
      <div className="flex items-center justify-between text-2xs text-theme-text-muted pt-spacing-xs border-t border-theme-border-subtle">
        <span className="font-mono text-2xs text-theme-text-secondary">
          {analysis.keyLevels}
        </span>
        <span className="text-2xs text-theme-text-muted">
          {analysis.sourcesLabel}
        </span>
      </div>
    </div>
  );
}
