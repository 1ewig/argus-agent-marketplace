'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { DEFAULT_CONVERSATION_SYMBOL } from '@/lib/db';

const SYMBOL_PARAM = 'symbol';
const VALID_SYMBOL_REGEX = /^[A-Z0-9]{2,12}$/;

/**
 * Dedicated hook that synchronizes the active symbol workspace with URL query parameters (?symbol=BTCUSDT).
 * Supports deep linking, browser back/forward (popstate), and bookmarking without page reloads.
 */
export function useUrlSymbolSync() {
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);

  // 1. Initial Mount: Read ?symbol= from URL ONCE on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const url = new URL(window.location.href);
      const urlSymbol = url.searchParams.get(SYMBOL_PARAM)?.trim().toUpperCase();

      if (urlSymbol && VALID_SYMBOL_REGEX.test(urlSymbol)) {
        const currentStoreSymbol = useAppStore.getState().selectedSymbol;
        if (urlSymbol !== currentStoreSymbol) {
          useAppStore.getState().setSelectedSymbol(urlSymbol);
        }
      } else {
        const current = useAppStore.getState().selectedSymbol || DEFAULT_CONVERSATION_SYMBOL;
        url.searchParams.set(SYMBOL_PARAM, current);
        window.history.replaceState(null, '', url.toString());
      }
    } catch {
      // Safe fallback if URL parsing fails
    }
  }, []);

  // 2. React to selectedSymbol state changes and update URL only
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const cleanSymbol = (selectedSymbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase();
      const url = new URL(window.location.href);
      const currentParam = url.searchParams.get(SYMBOL_PARAM)?.toUpperCase();

      if (currentParam !== cleanSymbol) {
        url.searchParams.set(SYMBOL_PARAM, cleanSymbol);
        window.history.replaceState(null, '', url.toString());
      }
    } catch {
      // Safe fallback
    }
  }, [selectedSymbol]);

  // 3. Listen to browser Back/Forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      try {
        const url = new URL(window.location.href);
        const urlSymbol = url.searchParams.get(SYMBOL_PARAM)?.trim().toUpperCase();

        if (urlSymbol && VALID_SYMBOL_REGEX.test(urlSymbol)) {
          const currentStoreSymbol = useAppStore.getState().selectedSymbol;
          if (urlSymbol !== currentStoreSymbol) {
            useAppStore.getState().setSelectedSymbol(urlSymbol);
          }
        }
      } catch {
        // Safe fallback
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
}
