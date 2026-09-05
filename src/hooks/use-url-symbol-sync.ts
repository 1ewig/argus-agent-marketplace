'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { DEFAULT_CONVERSATION_SYMBOL, DEFAULT_CONVERSATION_ID } from '@/lib/db';

const SYMBOL_PARAM = 'symbol';
const CHAT_PARAM = 'chat';
const VALID_SYMBOL_REGEX = /^[A-Z0-9]{2,12}$/;
const VALID_CHAT_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Dedicated hook that synchronizes the active symbol workspace and chat session ID
 * with URL query parameters (?symbol=BTCUSDT&chat=conv_123).
 * Supports deep linking, browser back/forward (popstate), and bookmarking without page reloads.
 */
export function useUrlSymbolSync() {
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const activeConversationId = useAppStore((state) => state.activeConversationId);
  const hasHydrated = useAppStore((state) => state._hasHydrated);

  // 1. Initial Mount: Read ?symbol= and ?chat= from URL once on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const url = new URL(window.location.href);
      const urlSymbol = url.searchParams.get(SYMBOL_PARAM)?.trim().toUpperCase();
      const urlChat = url.searchParams.get(CHAT_PARAM)?.trim();

      const store = useAppStore.getState();

      if (urlSymbol && VALID_SYMBOL_REGEX.test(urlSymbol)) {
        if (urlSymbol !== store.selectedSymbol) {
          store.setSelectedSymbol(urlSymbol);
        }
      }

      if (urlChat && VALID_CHAT_REGEX.test(urlChat)) {
        if (urlChat !== store.activeConversationId) {
          store.setActiveConversationId(urlChat);
        }
      }
    } catch {
      // Safe fallback if URL parsing fails
    }
  }, []);

  // 2. React to selectedSymbol and activeConversationId state changes and update URL
  useEffect(() => {
    if (typeof window === 'undefined' || !hasHydrated) return;

    try {
      const cleanSymbol = (selectedSymbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase();
      const cleanChat = activeConversationId || DEFAULT_CONVERSATION_ID;

      const url = new URL(window.location.href);
      const currentSymbolParam = url.searchParams.get(SYMBOL_PARAM)?.toUpperCase();
      const currentChatParam = url.searchParams.get(CHAT_PARAM);

      let hasChanged = false;

      if (currentSymbolParam !== cleanSymbol) {
        url.searchParams.set(SYMBOL_PARAM, cleanSymbol);
        hasChanged = true;
      }

      if (currentChatParam !== cleanChat) {
        url.searchParams.set(CHAT_PARAM, cleanChat);
        hasChanged = true;
      }

      if (hasChanged) {
        window.history.replaceState(null, '', url.toString());
      }
    } catch {
      // Safe fallback
    }
  }, [selectedSymbol, activeConversationId, hasHydrated]);

  // 3. Listen to browser Back/Forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      try {
        const url = new URL(window.location.href);
        const urlSymbol = url.searchParams.get(SYMBOL_PARAM)?.trim().toUpperCase();
        const urlChat = url.searchParams.get(CHAT_PARAM)?.trim();

        const store = useAppStore.getState();

        if (urlSymbol && VALID_SYMBOL_REGEX.test(urlSymbol) && urlSymbol !== store.selectedSymbol) {
          store.setSelectedSymbol(urlSymbol);
        }

        if (urlChat && VALID_CHAT_REGEX.test(urlChat) && urlChat !== store.activeConversationId) {
          store.setActiveConversationId(urlChat);
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
