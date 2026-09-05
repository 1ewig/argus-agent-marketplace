'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/stores/app-store';
import type { BinanceSymbolItem } from '@/app/api/binance/symbols/route';

export interface SymbolsApiResponse {
  success: boolean;
  count: number;
  symbols: BinanceSymbolItem[];
  warning?: string;
}

const EMPTY_SYMBOLS: BinanceSymbolItem[] = [];
const INITIAL_VISIBLE_COUNT = 30;
const LOAD_INCREMENT = 30;

export interface UseSymbolSearchResult {
  isOpen: boolean;
  searchTerm: string;
  selectedSymbol: string;
  selectedIndex: number;
  safeSelectedIndex: number;
  filteredSymbols: BinanceSymbolItem[];
  visibleSymbols: BinanceSymbolItem[];
  isLoading: boolean;
  isError: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  listRef: React.RefObject<HTMLDivElement | null>;
  setSearchTerm: (term: string) => void;
  setSelectedIndex: (index: number) => void;
  handleSearchChange: (val: string) => void;
  handleSelect: (symbol: string) => void;
  handleClose: () => void;
  handleListScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * Dedicated reactive hook orchestrating Binance symbol catalog queries,
 * fuzzy searching, infinite pagination, and accessible keyboard navigation.
 */
export function useSymbolSearch(): UseSymbolSearchResult {
  const isSymbolSearchOpen = useAppStore((state) => state.isSymbolSearchOpen);
  const setIsSymbolSearchOpen = useAppStore((state) => state.setIsSymbolSearchOpen);
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const setSelectedSymbol = useAppStore((state) => state.setSelectedSymbol);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // TanStack Query (1 hour server + client cache)
  const { data, isLoading, isError } = useQuery<SymbolsApiResponse>({
    queryKey: ['binance-usdt-symbols'],
    queryFn: async () => {
      const res = await fetch('/api/binance/symbols');
      if (!res.ok) throw new Error('Failed to fetch trading symbols');
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
    enabled: isSymbolSearchOpen,
  });

  const allSymbols = data?.symbols ?? EMPTY_SYMBOLS;

  // Fast memoized symbol filter
  const filteredSymbols = useMemo(() => {
    const q = searchTerm.trim().toUpperCase();
    if (!q) return allSymbols;

    return allSymbols.filter(
      (s) => s.symbol.includes(q) || s.baseAsset.toUpperCase().includes(q)
    );
  }, [allSymbols, searchTerm]);

  const safeSelectedIndex = filteredSymbols.length > 0
    ? Math.min(selectedIndex, filteredSymbols.length - 1)
    : 0;

  const visibleSymbols = useMemo(() => {
    return filteredSymbols.slice(0, visibleCount);
  }, [filteredSymbols, visibleCount]);

  // Keep references stable for high-frequency keyboard navigation
  const filteredSymbolsRef = useRef(filteredSymbols);
  const selectedIndexRef = useRef(safeSelectedIndex);
  const visibleCountRef = useRef(visibleCount);

  useEffect(() => {
    filteredSymbolsRef.current = filteredSymbols;
    selectedIndexRef.current = safeSelectedIndex;
    visibleCountRef.current = visibleCount;
  }, [filteredSymbols, safeSelectedIndex, visibleCount]);

  // Global hotkey: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSymbolSearchOpen(!isSymbolSearchOpen);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isSymbolSearchOpen, setIsSymbolSearchOpen]);

  // Focus input immediately when opened
  useEffect(() => {
    if (isSymbolSearchOpen) {
      inputRef.current?.focus();
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

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setSelectedIndex(0);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, []);

  // Keyboard navigation without re-binding listener on every keystroke
  useEffect(() => {
    if (!isSymbolSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const list = filteredSymbolsRef.current;
        setSelectedIndex((prev) => {
          const next = prev < list.length - 1 ? prev + 1 : prev;
          if (next >= visibleCountRef.current - 3 && visibleCountRef.current < list.length) {
            setVisibleCount((c) => Math.min(c + LOAD_INCREMENT, list.length));
          }
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const list = filteredSymbolsRef.current;
        const current = list[selectedIndexRef.current];
        if (current) {
          handleSelect(current.symbol);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSymbolSearchOpen, handleClose, handleSelect]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeElement = listRef.current.querySelector<HTMLElement>(`[data-index="${safeSelectedIndex}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ block: 'nearest' });
    }
  }, [safeSelectedIndex]);

  // Infinite scroll trigger
  const handleListScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      setVisibleCount((prev) => {
        if (prev >= filteredSymbols.length) return prev;
        return Math.min(prev + LOAD_INCREMENT, filteredSymbols.length);
      });
    }
  }, [filteredSymbols.length]);

  return {
    isOpen: isSymbolSearchOpen,
    searchTerm,
    selectedSymbol,
    selectedIndex,
    safeSelectedIndex,
    filteredSymbols,
    visibleSymbols,
    isLoading,
    isError,
    inputRef,
    listRef,
    setSearchTerm,
    setSelectedIndex,
    handleSearchChange,
    handleSelect,
    handleClose,
    handleListScroll,
  };
}
