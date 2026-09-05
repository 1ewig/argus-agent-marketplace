'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/stores/app-store';
import { APP_CONTENT } from '@/constants/content';
import {
  modalBackdropVariants,
  modalContentVariants,
  hoverScaleIcon,
  tapScaleIcon,
} from '@/constants/animation';
import type { BinanceSymbolItem } from '@/app/api/binance/symbols/route';

interface SymbolsApiResponse {
  success: boolean;
  count: number;
  symbols: BinanceSymbolItem[];
  warning?: string;
}

const EMPTY_SYMBOLS: BinanceSymbolItem[] = [];
const INITIAL_VISIBLE_COUNT = 30;
const LOAD_INCREMENT = 30;

export function SymbolSearchModal() {
  const isSymbolSearchOpen = useAppStore((state) => state.isSymbolSearchOpen);
  const setIsSymbolSearchOpen = useAppStore((state) => state.setIsSymbolSearchOpen);
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const setSelectedSymbol = useAppStore((state) => state.setSelectedSymbol);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch and cache symbols via TanStack Query (cached for 1 hour)
  const { data, isLoading, isError } = useQuery<SymbolsApiResponse>({
    queryKey: ['binance-usdt-symbols'],
    queryFn: async () => {
      const res = await fetch('/api/binance/symbols');
      if (!res.ok) {
        throw new Error('Failed to fetch trading symbols');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: isSymbolSearchOpen,
  });

  const allSymbols = data?.symbols ?? EMPTY_SYMBOLS;

  // Filter symbols based on query in real time
  const filteredSymbols = useMemo(() => {
    const q = searchTerm.trim().toUpperCase();
    if (!q) return allSymbols;

    return allSymbols.filter(
      (s) =>
        s.baseAsset.toUpperCase().includes(q) ||
        s.symbol.toUpperCase().includes(q)
    );
  }, [allSymbols, searchTerm]);

  // Lazy-loaded slice of visible symbols for optimal DOM performance
  const visibleSymbols = useMemo(() => {
    return filteredSymbols.slice(0, visibleCount);
  }, [filteredSymbols, visibleCount]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isSymbolSearchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSymbolSearchOpen]);

  const handleClose = useCallback(() => {
    setSearchTerm('');
    setSelectedIndex(0);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setIsSymbolSearchOpen(false);
  }, [setIsSymbolSearchOpen]);

  const handleSelect = useCallback(
    (symbol: string) => {
      setSelectedSymbol(symbol);
      handleClose();
    },
    [setSelectedSymbol, handleClose]
  );

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setSelectedIndex(0);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  // Safe selected index bounded by current filtered results
  const safeSelectedIndex = filteredSymbols.length > 0
    ? Math.min(selectedIndex, filteredSymbols.length - 1)
    : 0;

  // Infinite scroll trigger: load more symbols when reaching near bottom
  const handleListScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      setVisibleCount((prev) => {
        if (prev >= filteredSymbols.length) return prev;
        return Math.min(prev + LOAD_INCREMENT, filteredSymbols.length);
      });
    }
  }, [filteredSymbols.length]);

  // Keyboard navigation: Escape, ArrowUp, ArrowDown, Enter
  useEffect(() => {
    if (!isSymbolSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev < filteredSymbols.length - 1 ? prev + 1 : prev;
          if (next >= visibleCount - 3 && visibleCount < filteredSymbols.length) {
            setVisibleCount((c) => Math.min(c + LOAD_INCREMENT, filteredSymbols.length));
          }
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredSymbols[safeSelectedIndex]) {
          handleSelect(filteredSymbols[safeSelectedIndex].symbol);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSymbolSearchOpen, filteredSymbols, safeSelectedIndex, visibleCount, handleClose, handleSelect]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeElement = listRef.current.querySelector<HTMLElement>(`[data-index="${safeSelectedIndex}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ block: 'nearest' });
    }
  }, [safeSelectedIndex]);

  return (
    <AnimatePresence>
      {isSymbolSearchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="symbol-search-title"
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-spacing-md select-none"
        >
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="absolute inset-0 bg-theme-bg-overlay/65 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-theme-bg-surface border border-theme-border-subtle rounded-2xl shadow-2xl z-10 flex flex-col max-h-[75vh] overflow-hidden"
          >
            {/* 1. Header with Search Input */}
            <div className="p-3 border-b border-theme-border-subtle shrink-0">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 size-4 text-theme-brand-binance shrink-0 stroke-[2.25] pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={APP_CONTENT.symbolSearch.inputPlaceholder}
                  className="w-full h-11 pl-10 pr-9 bg-theme-bg-base border border-theme-border-subtle focus:border-theme-brand-binance rounded-xl text-xs sm:text-sm font-medium text-theme-text-primary placeholder:text-theme-text-muted outline-none transition-colors"
                />
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    title={APP_CONTENT.symbolSearch.clearSearch}
                    aria-label={APP_CONTENT.symbolSearch.clearSearch}
                    className="absolute right-3 p-1 rounded-md text-theme-text-muted hover:text-theme-text-primary hover:bg-theme-bg-elevated transition-colors cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : (
                  <kbd className="absolute right-3 hidden sm:inline-block text-2xs font-mono text-theme-text-muted bg-theme-bg-elevated px-1.5 py-0.5 rounded border border-theme-border-subtle pointer-events-none">
                    ESC
                  </kbd>
                )}
              </div>

              {/* Sub-header status bar */}
              <div className="flex items-center justify-between mt-2.5 px-1 text-2xs text-theme-text-muted">
                <span className="font-semibold uppercase tracking-wider text-theme-text-secondary">
                  {APP_CONTENT.symbolSearch.dialogTitle}
                </span>
                <span className="font-mono">
                  {visibleSymbols.length < filteredSymbols.length
                    ? APP_CONTENT.symbolSearch.showingCount(visibleSymbols.length, filteredSymbols.length)
                    : APP_CONTENT.symbolSearch.marketsCount(filteredSymbols.length)}
                </span>
              </div>
            </div>

            {/* 2. Symbols Scrollable List (Lazy Loaded) */}
            <div
              ref={listRef}
              onScroll={handleListScroll}
              className="flex-1 overflow-y-auto p-2 divide-y divide-theme-border-subtle/40 scrollbar-thin"
            >
              {isLoading && (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-theme-text-secondary">
                  <Loader2 className="size-5 animate-spin text-theme-brand-binance" />
                  <span className="text-xs font-medium">Loading Binance USDT markets...</span>
                </div>
              )}

              {isError && (
                <div className="py-8 text-center px-4">
                  <p className="text-xs text-theme-status-danger font-medium">
                    Unable to fetch symbols from Binance public API.
                  </p>
                </div>
              )}

              {!isLoading && filteredSymbols.length === 0 && (
                <div className="py-12 text-center px-4 flex flex-col items-center justify-center">
                  <p className="text-xs font-bold text-theme-text-primary mb-1">
                    {APP_CONTENT.symbolSearch.emptyTitle}
                  </p>
                  <p className="text-2xs text-theme-text-muted">
                    {APP_CONTENT.symbolSearch.emptySubtitle}
                  </p>
                </div>
              )}

              {!isLoading &&
                visibleSymbols.map((item, idx) => {
                  const isActive = item.symbol === selectedSymbol;
                  const isHighlighted = idx === safeSelectedIndex;

                  return (
                    <div
                      key={item.symbol}
                      data-index={idx}
                      onClick={() => handleSelect(item.symbol)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        isHighlighted
                          ? 'bg-theme-bg-elevated'
                          : 'hover:bg-theme-bg-elevated/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Token monogram pill */}
                        <div
                          className={`size-8 rounded-lg flex items-center justify-center font-bold text-2xs shrink-0 border transition-colors ${
                            isActive
                              ? 'bg-theme-brand-binance text-theme-bg-overlay border-theme-brand-binance font-extrabold'
                              : 'bg-theme-bg-base text-theme-text-primary border-theme-border-subtle group-hover:border-theme-border-strong'
                          }`}
                        >
                          {item.baseAsset.slice(0, 3)}
                        </div>

                        {/* Symbol Name and Quote */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-theme-text-primary truncate">
                              {item.baseAsset}
                            </span>
                            <span className="text-2xs font-semibold text-theme-text-muted">
                              / {item.quoteAsset}
                            </span>
                          </div>
                          <span className="text-2xs text-theme-text-muted font-mono truncate">
                            {item.symbol} • Binance Spot
                          </span>
                        </div>
                      </div>

                      {/* Right Indicator (Active checkmark or Enter hint) */}
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {isActive && (
                          <div className="flex items-center gap-1 text-2xs font-bold text-theme-brand-binance bg-theme-brand-binance/10 px-2 py-0.5 rounded-md border border-theme-brand-binance/20">
                            <Check className="size-3 stroke-[3]" />
                            <span className="tracking-wider">{APP_CONTENT.symbolSearch.activeBadge}</span>
                          </div>
                        )}

                        {isHighlighted && !isActive && (
                          <kbd className="hidden sm:inline-block text-2xs font-mono text-theme-text-muted bg-theme-bg-base px-1.5 py-0.5 rounded border border-theme-border-subtle">
                            ↵
                          </kbd>
                        )}
                      </div>
                    </div>
                  );
                })}

              {!isLoading && visibleCount < filteredSymbols.length && (
                <div className="py-2.5 text-center shrink-0">
                  <span className="text-2xs text-theme-text-muted font-mono">
                    {APP_CONTENT.symbolSearch.loadMoreHint(filteredSymbols.length - visibleCount)}
                  </span>
                </div>
              )}
            </div>

            {/* 3. Footer Keyboard Legend */}
            <div className="px-3.5 py-2.5 bg-theme-bg-base/70 border-t border-theme-border-subtle shrink-0 flex items-center justify-between text-2xs text-theme-text-muted">
              <span>{APP_CONTENT.symbolSearch.keyboardHint}</span>
              <motion.button
                type="button"
                whileHover={hoverScaleIcon}
                whileTap={tapScaleIcon}
                onClick={handleClose}
                className="p-1 rounded-md text-theme-text-muted hover:text-theme-text-primary transition-colors cursor-pointer"
                title={APP_CONTENT.symbolSearch.closeDialog}
                aria-label={APP_CONTENT.symbolSearch.closeDialog}
              >
                <X className="size-3.5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
