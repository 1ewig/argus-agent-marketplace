'use client';

import React from 'react';
import { MoreHorizontal, ShieldCheck } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export function AccountPortfolioCard() {
  const account = APP_CONTENT.cards.account;

  return (
    <div className="bg-theme-bg-surface border border-theme-border-subtle rounded-2xl p-spacing-md sm:p-spacing-lg shadow-sm flex flex-col justify-between flex-1 min-h-0">
      {/* Top Bar with Category & Overflow */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-theme-text-muted">
          {account.title}
        </span>
        <button
          type="button"
          aria-label={account.title}
          className="text-theme-text-muted hover:text-theme-text-primary transition-colors cursor-pointer"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Colossal Portfolio Metric */}
      <div className="my-auto py-spacing-xs">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-theme-text-primary tracking-tight font-sans">
            3,589,740
          </span>
          <span className="text-base sm:text-lg font-medium text-theme-text-secondary tracking-normal">
            USD
          </span>
        </div>
        <div className="text-xs text-theme-text-secondary mt-1">
          {account.subValue}
        </div>
      </div>

      {/* Bottom Collateral Status */}
      <div className="flex items-center justify-between pt-spacing-xs border-t border-theme-border-subtle text-xs text-theme-text-secondary">
        <span className="flex items-center gap-1.5 font-medium text-theme-status-success">
          <span className="size-1.5 rounded-full bg-theme-status-success" />
          {account.collateralLabel}
        </span>
        <span className="flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-theme-brand-binance bg-theme-brand-binance/10 px-2 py-0.5 rounded-full border border-theme-brand-binance/30">
          <ShieldCheck className="size-3" />
          {account.badge}
        </span>
      </div>
    </div>
  );
}
