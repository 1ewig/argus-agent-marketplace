'use client';

import React from 'react';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export function AccountPortfolioCard() {
  const account = APP_CONTENT.cards.account;

  return (
    <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-2xl p-spacing-md shadow-xs flex flex-col justify-between gap-spacing-sm flex-1 min-h-0">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <span className="text-2xs font-bold text-theme-text-muted uppercase tracking-wider">
          {account.title}
        </span>
        <div className="flex items-center gap-spacing-xs">
          <button
            type="button"
            title={account.refreshLabel}
            aria-label={account.refreshLabel}
            className="size-6 rounded-md flex items-center justify-center text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-elevated transition-colors cursor-pointer"
          >
            <RefreshCw className="size-3" />
          </button>
          <button
            type="button"
            aria-label={APP_CONTENT.sessions.openMenuAria}
            className="size-6 rounded-md flex items-center justify-center text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-elevated transition-colors cursor-pointer"
          >
            <MoreHorizontal className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Main Portfolio Stat */}
      <div>
        <div className="text-2xl font-extrabold text-theme-text-primary tracking-tight font-mono">
          {account.balanceUsd}
        </div>
        <div className="flex items-center gap-spacing-xs mt-1">
          <span className="text-2xs text-theme-text-secondary font-medium">
            {account.assetsCount}
          </span>
          <span className="size-1 rounded-full bg-theme-border-subtle" />
          <span className="text-2xs px-1.5 py-0.5 rounded bg-theme-bg-elevated border border-theme-border-subtle text-theme-brand-binance font-bold">
            {account.activeStatus}
          </span>
        </div>
      </div>

      {/* Assets Breakdown Grid */}
      <div className="grid grid-cols-2 gap-spacing-xs pt-spacing-xs border-t border-theme-border-subtle">
        {account.demoAssets.map((asset) => (
          <div
            key={asset.symbol}
            className="flex items-center justify-between p-spacing-xs px-spacing-sm rounded-lg bg-theme-bg-elevated border border-theme-border-subtle"
          >
            <div className="flex items-center gap-spacing-xs">
              <span className="text-2xs font-bold text-theme-text-primary">
                {asset.symbol}
              </span>
              <span className="text-2xs font-mono text-theme-text-muted">
                {asset.amount}
              </span>
            </div>
            <span className="text-2xs font-mono font-medium text-theme-text-secondary">
              {asset.usdValue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
