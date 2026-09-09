'use client';

import React, { memo, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ArrowUpDown,
  Trophy,
  Flame,
  Sparkles,
  Clock,
  ArrowDownNarrowWide,
  Check,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { MarketplaceSortKey } from '@/lib/8004scan/types';

export interface SortOption {
  id: MarketplaceSortKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SORT_OPTIONS: SortOption[] = [
  { id: 'leaderboard', label: APP_CONTENT.marketplace.tabs.leaderboard, icon: Trophy },
  { id: 'trending', label: APP_CONTENT.marketplace.tabs.trending, icon: Flame },
  { id: 'featured', label: APP_CONTENT.marketplace.tabs.featured, icon: Sparkles },
  { id: 'latest', label: APP_CONTENT.marketplace.tabs.latest, icon: Clock },
  { id: 'newest', label: APP_CONTENT.marketplace.tabs.newest, icon: ArrowDownNarrowWide },
];

export interface SortDropdownProps {
  currentSort: MarketplaceSortKey;
  onSelectSort: (sort: MarketplaceSortKey) => void;
  isOpen: boolean;
  onToggleOpen: (open: boolean) => void;
}

export const SortDropdown = memo(function SortDropdown({
  currentSort,
  onSelectSort,
  isOpen,
  onToggleOpen,
}: SortDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onToggleOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onToggleOpen]);

  const activeSort = SORT_OPTIONS.find((s) => s.id === currentSort);
  const sortLabel = activeSort?.label ?? APP_CONTENT.marketplace.tabs.leaderboard;
  const SortTriggerIcon = activeSort?.icon ?? ArrowUpDown;

  const handleSelect = (sortId: MarketplaceSortKey) => {
    onSelectSort(sortId);
    onToggleOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => onToggleOpen(!isOpen)}
        className={`h-7.5 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all border ${
          activeSort
            ? 'bg-theme-bg-elevated text-theme-brand-binance border-theme-brand-binance/35 font-semibold'
            : 'bg-theme-bg-elevated/40 text-theme-text-secondary hover:text-theme-text-primary border-theme-border-subtle'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <SortTriggerIcon
          className={`size-3.5 shrink-0 ${
            activeSort ? 'text-theme-brand-binance' : 'text-theme-text-muted'
          }`}
        />
        <span className="text-theme-text-muted">
          {APP_CONTENT.marketplace.tabs.sortBy}:
        </span>
        <span className="truncate max-w-[110px]">{sortLabel}</span>
        <ChevronDown
          className={`size-3 text-theme-text-muted transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-theme-bg-surface/95 backdrop-blur-md border border-theme-border-subtle rounded-xl shadow-2xl p-1 z-30 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isCurrent = currentSort === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`h-8 w-full px-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors text-left ${
                  isCurrent
                    ? 'bg-theme-bg-elevated text-theme-brand-binance font-semibold'
                    : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/50'
                }`}
              >
                <Icon
                  className={`size-3.5 shrink-0 ${
                    isCurrent ? 'text-theme-brand-binance' : 'text-theme-text-muted'
                  }`}
                />
                <span className="flex-1 truncate">{opt.label}</span>
                {isCurrent && (
                  <Check className="size-3.5 text-theme-brand-binance shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
