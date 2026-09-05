'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, Loader2 } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { modalBackdropVariants, modalContentVariants } from '@/constants/animation';
import { useSymbolSearch } from '@/hooks';

/**
 * Pure presentation Command Palette modal for quick Binance market search & switching.
 * Business logic, caching, keyboard navigation, and pagination are delegated to `useSymbolSearch`.
 */
export function SymbolSearchModal() {
  const {
    isOpen,
    searchTerm,
    selectedSymbol,
    safeSelectedIndex,
    filteredSymbols,
    visibleSymbols,
    isLoading,
    isError,
    inputRef,
    listRef,
    setSelectedIndex,
    handleSearchChange,
    handleSelect,
    handleClose,
    handleListScroll,
  } = useSymbolSearch();

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none"
        >
          {/* Minimal Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Clean Command Palette Container */}
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-theme-bg-surface border border-theme-border-subtle rounded-xl shadow-2xl z-10 flex flex-col max-h-[480px] overflow-hidden"
          >
            {/* Seamless Search Input Header */}
            <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-theme-border-subtle shrink-0">
              <Search className="size-4 text-theme-text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={APP_CONTENT.symbolSearch.inputPlaceholder}
                className="flex-1 bg-transparent text-sm font-medium text-theme-text-primary placeholder:text-theme-text-muted outline-none"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="p-1 rounded text-theme-text-muted hover:text-theme-text-primary transition-colors cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block text-2xs font-mono text-theme-text-muted bg-theme-bg-elevated/70 px-1.5 py-0.5 rounded border border-theme-border-subtle pointer-events-none">
                  ESC
                </kbd>
              )}
            </div>

            {/* Symbols List */}
            <div
              ref={listRef}
              onScroll={handleListScroll}
              className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar"
            >
              {isLoading && (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-theme-text-muted">
                  <Loader2 className="size-4 animate-spin text-theme-brand-binance" />
                  <span className="text-xs">{APP_CONTENT.symbolSearch.loading}</span>
                </div>
              )}

              {isError && (
                <div className="py-8 text-center px-4">
                  <p className="text-xs text-theme-status-danger font-medium">
                    {APP_CONTENT.symbolSearch.errorMessage}
                  </p>
                </div>
              )}

              {!isLoading && filteredSymbols.length === 0 && (
                <div className="py-10 text-center px-4">
                  <p className="text-xs font-semibold text-theme-text-primary mb-0.5">
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
                      onMouseEnter={() => {
                        if (safeSelectedIndex !== idx) setSelectedIndex(idx);
                      }}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        isHighlighted
                          ? 'bg-theme-bg-elevated'
                          : 'hover:bg-theme-bg-elevated/50'
                      }`}
                    >
                      {/* Clean Symbol & Quote */}
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-theme-text-primary tracking-tight">
                          {item.baseAsset}
                        </span>
                        <span className="text-2xs font-medium text-theme-text-muted">
                          /{item.quoteAsset}
                        </span>
                      </div>

                      {/* Status / Selection Indicator */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isActive && (
                          <Check className="size-3.5 text-theme-brand-binance stroke-[2.5]" />
                        )}
                        {isHighlighted && !isActive && (
                          <span className="hidden sm:inline-block text-2xs font-mono text-theme-text-muted opacity-60">
                            ↵
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Minimal Command Palette Footer */}
            <div className="px-3.5 py-2 bg-theme-bg-base/50 border-t border-theme-border-subtle shrink-0 flex items-center justify-between text-2xs text-theme-text-muted font-mono">
              <div className="flex items-center gap-3">
                <span>{APP_CONTENT.symbolSearch.navLegend}</span>
                <span>{APP_CONTENT.symbolSearch.selectLegend}</span>
                <span>{APP_CONTENT.symbolSearch.escLegend}</span>
              </div>
              <span>{APP_CONTENT.symbolSearch.pairsCount(filteredSymbols.length)}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}