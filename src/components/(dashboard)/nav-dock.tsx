'use client';

import React from 'react';
import {
  LayoutGrid,
  Wallet,
  Radio,
  FileText,
  LineChart,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export type NavTabId = 'dashboard' | 'wallet' | 'alerts' | 'reports' | 'analytics';

interface NavDockProps {
  activeTab?: NavTabId;
  onSelectTab?: (tab: NavTabId) => void;
}

export function NavDock({ activeTab = 'dashboard', onSelectTab }: NavDockProps) {
  const navItems: Array<{ id: NavTabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: APP_CONTENT.nav.items.dashboard, icon: LayoutGrid },
    { id: 'wallet', label: APP_CONTENT.nav.items.wallet, icon: Wallet },
    { id: 'alerts', label: APP_CONTENT.nav.items.alerts, icon: Radio },
    { id: 'reports', label: APP_CONTENT.nav.items.reports, icon: FileText },
    { id: 'analytics', label: APP_CONTENT.nav.items.analytics, icon: LineChart },
  ];

  return (
    <nav
      aria-label={APP_CONTENT.header.title}
      className="flex flex-col items-center justify-between py-spacing-md px-spacing-xs bg-theme-bg-surface border-r border-theme-border-subtle shrink-0 w-16 select-none"
    >
      {/* Brand Monogram Badge */}
      <div className="flex flex-col items-center gap-spacing-lg w-full">
        <div
          title={APP_CONTENT.nav.brandTooltip}
          className="size-10 rounded-xl bg-theme-bg-overlay flex items-center justify-center text-theme-brand-binance font-extrabold text-base shadow-sm cursor-pointer transition-transform hover:scale-105"
        >
          {APP_CONTENT.nav.brandMonogram}
        </div>

        {/* Vertical Nav Icons Dock */}
        <div className="flex flex-col items-center gap-spacing-xs w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab?.(item.id)}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`size-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-theme-bg-overlay text-theme-brand-binance shadow-2xs'
                    : 'text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-elevated'
                }`}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Track / Version Pill */}
      <div className="flex flex-col items-center">
        <span className="text-2xs font-extrabold text-theme-brand-binance tracking-tighter uppercase px-spacing-xs py-0.5 rounded bg-theme-bg-elevated border border-theme-border-subtle">
          {APP_CONTENT.header.hackathonTrack}
        </span>
      </div>
    </nav>
  );
}
