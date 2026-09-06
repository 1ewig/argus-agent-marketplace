'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { APP_CONTENT } from '@/constants/content';
import { useAppStore } from '@/stores/app-store';
import {
  ensureDefaultConversation,
  ensureDefaultGlobalConversation,
  getConversation,
  getConversationMessageCount,
  listConversations,
  DEFAULT_CONVERSATION_SYMBOL,
  openOrCreateConversationForSymbol,
  createConversation,
  deleteConversation,
  renameConversation,
  useConversations,
  useConversationMessageCount,
  clearMessagesCache,
  type ConversationRecord,
} from '@/lib/db';
import { GLOBAL_WORKSPACE_SYMBOL, isGlobalSymbol } from '@/lib/utils';
import { parseSymbolAssets } from '@/lib/symbols';
export { parseSymbolAssets };

export interface SymbolWorkspaceGroup {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  conversations: ConversationRecord[];
  latestTimestamp: number;
  isGlobal?: boolean;
}

let isSessionInitStarted = false;

/**
 * Custom hook managing session list subscriptions, workspace grouping by symbol,
 * active conversation selection, inline renaming, deletion, and cross-workspace sync.
 */
export function useChatSessions() {
  const activeConversationId = useAppStore((state) => state.activeConversationId);
  const setActiveConversationId = useAppStore((state) => state.setActiveConversationId);
  const selectedSymbol = useAppStore((state) => state.selectedSymbol);
  const setSelectedSymbol = useAppStore((state) => state.setSelectedSymbol);
  const lastActiveSymbol = useAppStore((state) => state.lastActiveSymbol);
  const isStreamingActive = useAppStore((state) => state.activeStreamMessage !== null);
  const setActiveStreamMessage = useAppStore((state) => state.setActiveStreamMessage);
  const setErrorNotice = useAppStore((state) => state.setErrorNotice);
  const hasHydrated = useAppStore((state) => state._hasHydrated);

  const activeMessageCount = useConversationMessageCount(activeConversationId);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize and validate persisted session ONCE on client mount after store hydration
  useEffect(() => {
    if (!hasHydrated) return;
    if (isSessionInitStarted) return;
    isSessionInitStarted = true;

    async function initSession() {
      const store = useAppStore.getState();
      const activeId = store.activeConversationId;
      const currentSymbol = (store.selectedSymbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase();

      // Guarantee permanent default conversation for Global Market exists
      await ensureDefaultGlobalConversation();

      // 1. Check if active conversation exists in Dexie
      if (activeId) {
        const activeConv = await getConversation(activeId);
        if (activeConv) {
          // If active conversation has a symbol and store's symbol doesn't match, sync store's symbol
          if (activeConv.symbol && activeConv.symbol.toUpperCase() !== currentSymbol) {
            setSelectedSymbol(activeConv.symbol.toUpperCase());
          }
          return; // Active conversation and group preserved on refresh!
        }
      }

      // 2. If activeId doesn't exist, check all conversations in database
      const allConvs = await listConversations();
      if (allConvs.length > 0) {
        const matching = allConvs.filter(
          (c) => (c.symbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase() === currentSymbol
        );
        if (matching.length > 0) {
          const sorted = [...matching].sort(
            (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
          );
          setActiveConversationId(sorted[0].id);
        } else {
          setActiveConversationId(allConvs[0].id);
          if (allConvs[0].symbol) {
            setSelectedSymbol(allConvs[0].symbol.toUpperCase());
          }
        }
        return;
      }

      // 3. Database is completely empty: initialize first default conversation
      const defaultConv = await ensureDefaultConversation(currentSymbol);
      setActiveConversationId(defaultConv.id);
    }

    void initSession();
  }, [hasHydrated, setActiveConversationId, setSelectedSymbol]);

  // Reactive subscription to all conversations
  const conversations = useConversations();

  // Active session title & record
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );
  const currentTitle = activeConversation?.title ?? APP_CONTENT.chat.defaultSessionTitle;

  const isActiveConversationInSelectedSymbol = useMemo(() => {
    if (!activeConversation) return false;
    const convSymbol = (activeConversation.symbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase();
    const currentSymbol = (selectedSymbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase();
    return convSymbol === currentSymbol;
  }, [activeConversation, selectedSymbol]);

  const isNewChatDisabled = Boolean(
    isActiveConversationInSelectedSymbol &&
    activeMessageCount === 0 &&
    !isStreamingActive
  );

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
      const isGlobal = isGlobalSymbol(sym);
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
        isGlobal,
      });
    }

    const sortedGroups = groups.sort((a, b) => {
      if (a.isGlobal && !b.isGlobal) return -1;
      if (!a.isGlobal && b.isGlobal) return 1;
      return b.latestTimestamp - a.latestTimestamp;
    });

    // Guarantee the permanent Global Market group is always at the top
    if (!sortedGroups.some((g) => g.isGlobal)) {
      sortedGroups.unshift({
        symbol: GLOBAL_WORKSPACE_SYMBOL,
        baseAsset: GLOBAL_WORKSPACE_SYMBOL,
        quoteAsset: '',
        conversations: [],
        latestTimestamp: 0,
        isGlobal: true,
      });
    }

    return sortedGroups;
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
        if (activeCount === 0 && !isStreamingActive) {
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
      isStreamingActive,
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

      // Query fresh conversations from database to avoid stale React closures
      let freshConvs = await listConversations();

      // If all chats in GLOBAL were deleted, guarantee a fresh default one is restored
      const hasGlobal = freshConvs.some(
        (c) => isGlobalSymbol(c.symbol)
      );
      if (!hasGlobal) {
        const restoredGlobal = await ensureDefaultGlobalConversation();
        freshConvs = [restoredGlobal, ...freshConvs];
      }

      if (activeConversationId === id) {
        // Prefer staying within the current workspace if another conversation exists
        const currentWorkspace = (selectedSymbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase();
        const sameWorkspaceConv = freshConvs.find(
          (c) => (c.symbol || DEFAULT_CONVERSATION_SYMBOL).toUpperCase() === currentWorkspace
        );

        if (sameWorkspaceConv) {
          setActiveConversationId(sameWorkspaceConv.id);
        } else if (freshConvs.length > 0) {
          const nextConv = freshConvs[0];
          setActiveConversationId(nextConv.id);
          if (nextConv.symbol) {
            setSelectedSymbol(nextConv.symbol.toUpperCase());
          }
        } else {
          // Absolute fallback if database is completely empty
          const targetSymbol = selectedSymbol || DEFAULT_CONVERSATION_SYMBOL;
          const newConv = await createConversation(undefined, targetSymbol);
          setActiveConversationId(newConv.id);
        }
      }
    },
    [activeConversationId, selectedSymbol, setActiveConversationId, setSelectedSymbol]
  );

  // Switch symbol workspace: opens existing conversation in that group or creates a new one
  const handleSelectSymbolWorkspace = useCallback(
    async (targetSymbolRaw: string) => {
      const targetSymbol = (targetSymbolRaw || DEFAULT_CONVERSATION_SYMBOL).toUpperCase();

      setErrorNotice(null);
      setIsMenuOpen(false);
      setEditingId(null);
      setActiveStreamMessage(null);

      setSelectedSymbol(targetSymbol);

      const targetId = await openOrCreateConversationForSymbol(targetSymbol);
      setActiveConversationId(targetId);
    },
    [
      setErrorNotice,
      setActiveStreamMessage,
      setSelectedSymbol,
      setActiveConversationId,
    ]
  );

  const isGlobalActive = isGlobalSymbol(selectedSymbol);

  // Open or switch to the Global Workspace
  const handleSelectGlobalWorkspace = useCallback(async () => {
    await handleSelectSymbolWorkspace(GLOBAL_WORKSPACE_SYMBOL);
  }, [handleSelectSymbolWorkspace]);

  // Return from Global Workspace back to the last active symbol workspace
  const handleReturnToSymbolWorkspace = useCallback(async () => {
    const target =
      lastActiveSymbol && !isGlobalSymbol(lastActiveSymbol)
        ? lastActiveSymbol
        : DEFAULT_CONVERSATION_SYMBOL;
    await handleSelectSymbolWorkspace(target);
  }, [lastActiveSymbol, handleSelectSymbolWorkspace]);

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
    handleSelectSymbolWorkspace,
    handleSelectGlobalWorkspace,
    handleReturnToSymbolWorkspace,
    handleStartRename,
    handleSaveRename,
    handleCancelRename,
    handleDeleteSession,
    isNewChatDisabled,
    activeMessageCount,
    isGlobalActive,
  };
}
