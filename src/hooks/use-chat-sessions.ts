'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { APP_CONTENT } from '@/constants/content';
import { useAppStore } from '@/stores/app-store';
import {
  ensureDefaultConversation,
  getConversation,
  getConversationMessageCount,
  listConversations,
  DEFAULT_CONVERSATION_ID,
  DEFAULT_CONVERSATION_SYMBOL,
  createConversation,
  deleteConversation,
  renameConversation,
  useConversations,
  useConversationMessageCount,
  clearMessagesCache,
  type ConversationRecord,
} from '@/lib/db';

export interface SymbolWorkspaceGroup {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  conversations: ConversationRecord[];
  latestTimestamp: number;
}

/**
 * Splits a standard Binance trading pair (e.g. BTCUSDT) into base and quote assets.
 */
export function parseSymbolAssets(symbol: string): { baseAsset: string; quoteAsset: string } {
  const upper = (symbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase();
  if (upper.endsWith('USDT')) {
    return { baseAsset: upper.slice(0, -4), quoteAsset: 'USDT' };
  }
  if (upper.endsWith('USDC')) {
    return { baseAsset: upper.slice(0, -4), quoteAsset: 'USDC' };
  }
  if (upper.endsWith('BUSD')) {
    return { baseAsset: upper.slice(0, -4), quoteAsset: 'BUSD' };
  }
  if (upper.endsWith('BTC') && upper.length > 3) {
    return { baseAsset: upper.slice(0, -3), quoteAsset: 'BTC' };
  }
  return { baseAsset: upper, quoteAsset: '' };
}

/**
 * Custom hook managing session list subscriptions, workspace grouping by symbol,
 * active conversation selection, inline renaming, deletion, and cross-workspace sync.
 */
export function useChatSessions() {
  const activeConversationId = useAppStore((state) => state.activeConversationId);
  const setActiveConversationId = useAppStore((state) => state.setActiveConversationId);
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const setSelectedSymbol = useAppStore((state) => state.setSelectedSymbol);
  const activeStreamMessage = useAppStore((state) => state.activeStreamMessage);
  const setActiveStreamMessage = useAppStore((state) => state.setActiveStreamMessage);
  const setErrorNotice = useAppStore((state) => state.setErrorNotice);

  const activeMessageCount = useConversationMessageCount(activeConversationId);
  const isNewChatDisabled = activeMessageCount === 0 && !activeStreamMessage;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize default conversation record and validate persisted session on client mount
  useEffect(() => {
    let isCancelled = false;
    async function initSession() {
      const currentSymbol = useAppStore.getState().selectedSymbol || DEFAULT_CONVERSATION_SYMBOL;
      await ensureDefaultConversation(currentSymbol);
      if (isCancelled) return;

      const currentId = useAppStore.getState().activeConversationId;
      const existing = await getConversation(currentId);
      if (isCancelled) return;

      if (!existing) {
        const all = await listConversations();
        if (isCancelled) return;
        const fallback = all[0];
        const fallbackId = fallback?.id ?? DEFAULT_CONVERSATION_ID;
        setActiveConversationId(fallbackId);
        if (fallback?.symbol) {
          setSelectedSymbol(fallback.symbol);
        }
      } else if (existing.symbol && existing.symbol !== useAppStore.getState().selectedSymbol) {
        setSelectedSymbol(existing.symbol);
      }
    }

    void initSession();

    return () => {
      isCancelled = true;
    };
  }, [setActiveConversationId, setSelectedSymbol]);

  // Reactive subscription to all conversations
  const conversations = useConversations();

  // Active session title & record
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );
  const currentTitle = activeConversation?.title ?? APP_CONTENT.chat.defaultSessionTitle;

  // Group conversations by symbol workspaces
  const symbolGroups = useMemo<SymbolWorkspaceGroup[]>(() => {
    const groupsMap = new Map<string, ConversationRecord[]>();
    for (const conv of conversations) {
      const sym = (conv.symbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase();
      const list = groupsMap.get(sym) || [];
      list.push(conv);
      groupsMap.set(sym, list);
    }

    const groups: SymbolWorkspaceGroup[] = [];
    for (const [sym, convs] of groupsMap.entries()) {
      const { baseAsset, quoteAsset } = parseSymbolAssets(sym);
      const sortedConvs = [...convs].sort(
        (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
      );
      const latestTimestamp = sortedConvs.reduce(
        (max, c) => Math.max(max, c.updatedAt || c.createdAt || 0),
        0
      );
      groups.push({
        symbol: sym,
        baseAsset,
        quoteAsset,
        conversations: sortedConvs,
        latestTimestamp,
      });
    }

    return groups.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  }, [conversations]);

  // Click-outside listener for sessions overflow menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setEditingId(null);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
    setEditingId(null);
  }, []);

  // Create a brand new session thread in active or overridden symbol workspace
  const handleNewSession = useCallback(
    async (symbolOverride?: string) => {
      const targetSymbol = (symbolOverride || selectedSymbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase();

      setErrorNotice(null);
      setIsMenuOpen(false);
      setEditingId(null);
      setActiveStreamMessage(null);

      if (targetSymbol !== selectedSymbol) {
        setSelectedSymbol(targetSymbol);
      }

      // 1. Check if current active conversation is already in this symbol workspace and empty
      const currentActive = conversations.find((c) => c.id === activeConversationId);
      const currentActiveSymbol = (currentActive?.symbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase();
      if (currentActive && currentActiveSymbol === targetSymbol) {
        const activeCount = await getConversationMessageCount(currentActive.id);
        if (activeCount === 0 && !activeStreamMessage) {
          return;
        }
      }

      // 2. Check all conversations in this symbol workspace for an existing empty one
      const all = await listConversations();
      for (const conv of all) {
        const convSymbol = (conv.symbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase();
        if (convSymbol === targetSymbol) {
          const count = await getConversationMessageCount(conv.id);
          if (count === 0) {
            setActiveConversationId(conv.id);
            return;
          }
        }
      }

      // 3. Only create a new conversation if all existing ones have messages
      const newConv = await createConversation(undefined, targetSymbol);
      setActiveConversationId(newConv.id);
    },
    [
      selectedSymbol,
      activeConversationId,
      conversations,
      activeStreamMessage,
      setErrorNotice,
      setActiveStreamMessage,
      setSelectedSymbol,
      setActiveConversationId,
    ]
  );

  // Switch session & automatically sync workspace selectedSymbol
  const handleSelectSession = useCallback(
    (id: string) => {
      const target = conversations.find((c) => c.id === id);
      if (target?.symbol) {
        setSelectedSymbol(target.symbol);
      }
      setActiveConversationId(id);
      setIsMenuOpen(false);
      setEditingId(null);
      setActiveStreamMessage(null);
    },
    [conversations, setSelectedSymbol, setActiveConversationId, setActiveStreamMessage]
  );

  // Start renaming session
  const handleStartRename = useCallback((id: string, sessionTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(sessionTitle);
  }, []);

  // Save renamed session
  const handleSaveRename = useCallback(async (id: string, e?: React.FormEvent | React.MouseEvent) => {
    e?.stopPropagation();
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    await renameConversation(id, trimmed);
    setEditingId(null);
  }, [editTitle]);

  // Cancel renaming
  const handleCancelRename = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  }, []);

  // Delete session
  const handleDeleteSession = useCallback(
    async (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      await deleteConversation(id);
      clearMessagesCache(id);
      if (activeConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          const nextConv = remaining[0];
          setActiveConversationId(nextConv.id);
          if (nextConv.symbol) {
            setSelectedSymbol(nextConv.symbol);
          }
        } else {
          const targetSymbol = selectedSymbol || DEFAULT_CONVERSATION_SYMBOL;
          const newConv = await createConversation(undefined, targetSymbol);
          setActiveConversationId(newConv.id);
        }
      }
    },
    [activeConversationId, conversations, selectedSymbol, setActiveConversationId, setSelectedSymbol]
  );

  return {
    activeConversationId,
    activeConversation,
    currentTitle,
    conversations,
    symbolGroups,
    isMenuOpen,
    setIsMenuOpen,
    editingId,
    setEditingId,
    editTitle,
    setEditTitle,
    menuRef,
    handleToggleMenu,
    handleNewSession,
    handleSelectSession,
    handleStartRename,
    handleSaveRename,
    handleCancelRename,
    handleDeleteSession,
    isNewChatDisabled,
    activeMessageCount,
  };
}
