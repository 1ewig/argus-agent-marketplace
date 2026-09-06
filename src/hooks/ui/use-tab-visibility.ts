'use client';

import { useSyncExternalStore } from 'react';

const getIsTabVisible = () =>
  typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;

const subscribeVisibility = (callback: () => void) => {
  if (typeof document === 'undefined') return () => {};
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
};

/**
 * Reactive hook that tracks whether the browser tab is currently visible.
 * Uses useSyncExternalStore for SSR-safe and tear-free subscription.
 */
export function useTabVisibility(): boolean {
  return useSyncExternalStore(subscribeVisibility, getIsTabVisible, () => true);
}
