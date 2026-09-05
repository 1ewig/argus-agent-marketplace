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
  createConversation,
  deleteConversation,
  renameConversation,
  useConversations,
  useConversationMessageCount,
  clearMessagesCache,
} from '@/lib/db';

/**
 * Custom hook managing session list subscriptions, active conversation selection,
 * inline renaming, deletion, and dropdown menu visibility with click-outside detection.
 */
export function useChatSessions() {
  const activeConversationId = useAppStore((state) => state.activeConversationId);
  const setActiveConversationId = useAppStore((state) => state.setActiveConversationId);
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
      await ensureDefaultConversation();
      if (isCancelled) return;

      const currentId = useAppStore.getState().activeConversationId;
      const existing = await getConversation(currentId);
      if (isCancelled) return;

      if (!existing) {
        const all = await listConversations();
        if (isCancelled) return;
        const fallbackId = all[0]?.id ?? DEFAULT_CONVERSATION_ID;
        setActiveConversationId(fallbackId);
      }
    }

    void initSession();

    return () => {
      isCancelled = true;
    };
  }, [setActiveConversationId]);

  // Reactive subscription to all conversations
  const conversations = useConversations();

  // Active session title
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );
  const currentTitle = activeConversation?.title ?? APP_CONTENT.chat.defaultSessionTitle;

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

  // Create a brand new session thread (disabled if active session is already empty)
  const handleNewSession = useCallback(async () => {
    if (isNewChatDisabled) return;

    setErrorNotice(null);
    setIsMenuOpen(false);
    setEditingId(null);
    setActiveStreamMessage(null);

    // If an unused empty conversation already exists elsewhere, navigate to it instead of creating duplicates
    const all = await listConversations();
    for (const conv of all) {
      if (conv.id !== activeConversationId) {
        const count = await getConversationMessageCount(conv.id);
        if (count === 0) {
          setActiveConversationId(conv.id);
          return;
        }
      }
    }

    const newConv = await createConversation();
    setActiveConversationId(newConv.id);
  }, [
    isNewChatDisabled,
    activeConversationId,
    setErrorNotice,
    setActiveStreamMessage,
    setActiveConversationId,
  ]);

  // Switch session
  const handleSelectSession = useCallback((id: string) => {
    setActiveConversationId(id);
    setIsMenuOpen(false);
    setEditingId(null);
    setActiveStreamMessage(null);
  }, [setActiveConversationId, setActiveStreamMessage]);

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
  const handleDeleteSession = useCallback(async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await deleteConversation(id);
    clearMessagesCache(id);
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        const newConv = await createConversation();
        setActiveConversationId(newConv.id);
      }
    }
  }, [activeConversationId, conversations, setActiveConversationId]);

  return {
    activeConversationId,
    activeConversation,
    currentTitle,
    conversations,
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
