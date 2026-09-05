import React from 'react';

/**
 * Formats numbers into clean currency strings, adapting precision for sub-penny crypto assets.
 */
export function formatUsd(val: unknown): string {
  const num = typeof val === 'number' ? val : Number(val);
  if (Number.isNaN(num)) return '—';
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (num >= 1) return `$${num.toFixed(2)}`;
  if (num >= 0.0001) return `$${num.toFixed(4)}`;
  if (num > 0) return `$${num.toFixed(6)}`;
  return '$0.00';
}

export function formatPercent(val: unknown): { text: string; isPositive: boolean; isNegative: boolean } {
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
export function formatOrderQty(val: unknown): string {
  const num = typeof val === 'number' ? val : Number(val);
  if (Number.isNaN(num)) return '—';
  if (num >= 1000) return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (num >= 10) return num.toFixed(2);
  if (num >= 1) return num.toFixed(3);
  if (num >= 0.0001) return Number(num.toFixed(4)).toString();
  return num.toString();
}

/**
 * Minimal, low-profile stat item for multi-metric tool cards.
 */
export function MetricItem({
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
