'use client';

import { useSyncExternalStore, useCallback } from 'react';

export const SIDEBAR_STORAGE_KEY = 'argus-sidebar-collapsed';

function getSidebarSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === SIDEBAR_STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Custom hook managing sidebar collapsed state via useSyncExternalStore.
 * Synchronously reads persisted state from localStorage on first render to eliminate
 * any expanded->collapsed flash on page reload, while broadcasting updates across tabs.
 */
export function useSidebar() {
  const isSidebarCollapsed = useSyncExternalStore(
    subscribe,
    getSidebarSnapshot,
    getServerSnapshot
  );

  const setIsSidebarCollapsed = useCallback((collapsed: boolean) => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
      if (typeof document !== 'undefined') {
        if (collapsed) {
          document.documentElement.classList.add('sidebar-collapsed');
        } else {
          document.documentElement.classList.remove('sidebar-collapsed');
        }
      }
    } catch {
      // Ignore storage errors in private browsing/quota limits
    }
    notifyListeners();
  }, []);

  const toggleSidebar = useCallback(() => {
    const current = getSidebarSnapshot();
    setIsSidebarCollapsed(!current);
  }, [setIsSidebarCollapsed]);

  return {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar,
  };
}
