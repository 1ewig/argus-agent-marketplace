'use client';

import React, { memo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export interface MarketplaceSearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

export const MarketplaceSearchInput = memo(function MarketplaceSearchInput({
  searchQuery,
  onSearchChange,
  onClearSearch,
}: MarketplaceSearchInputProps) {
  const globalSearchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        globalSearchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm">
      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-theme-text-muted">
        <Search className="size-3.5" />
      </div>
      <input
        ref={globalSearchRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={APP_CONTENT.marketplace.header.searchPlaceholder}
        className="w-full h-7.5 pl-8 pr-8 bg-theme-bg-elevated/50 hover:bg-theme-bg-elevated focus:bg-theme-bg-elevated border border-theme-border-subtle focus:border-theme-brand-binance/60 rounded-lg text-xs text-theme-text-primary placeholder:text-theme-text-muted outline-none transition-all"
      />
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
        {searchQuery ? (
          <button
            type="button"
            onClick={onClearSearch}
            title={APP_CONTENT.marketplace.header.searchClear}
            className="size-5 rounded flex items-center justify-center text-theme-text-muted hover:text-theme-text-primary cursor-pointer transition-colors"
          >
            <X className="size-3" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center px-1 text-3xs font-mono text-theme-text-muted bg-theme-bg-base/60 rounded border border-theme-border-subtle/70">
            /
          </kbd>
        )}
      </div>
    </div>
  );
});
