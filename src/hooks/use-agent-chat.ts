'use client';

import { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { APP_CONTENT } from '@/constants/content';
import { generateMessageId, getNowTimestamp } from '@/lib/utils';
import {
  db,
  DEFAULT_CONVERSATION_ID,
  ensureDefaultConversation,
  createConversation,
  deleteConversation,
  renameConversation,
  saveStoredMessage,
  listConversations,
  type ChatMessageRecord,
} from '@/lib/db';
import type { AgentResult } from '@/agent';
import type { ExecutionMode } from '@/lib/types';

export interface UseAgentChatOptions {
  mode?: ExecutionMode;
}

/**
 * Custom hook encapsulating all session lifecycle management, reactive IndexedDB queries,
 * and autonomous Binance Agent OS reasoning dispatch.
 * 
 * Enforces strict separation of concerns by completely decoupling chat orchestration
 * and database state mutations from UI presentation components.
 * 
 * @param options - Execution mode ('simulation' | 'live_mcp')
 * @returns State, refs, and action handlers for the chat console
 */
export function useAgentChat({ mode = 'simulation' }: UseAgentChatOptions = {}) {
  const [activeConversationId, setActiveConversationId] = useState<string>(DEFAULT_CONVERSATION_ID);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 1. Initialize default conversation record safely on client mount
  useEffect(() => {
    void ensureDefaultConversation();
  }, []);

  // 2. Reactive Live Queries directly from Dexie IndexedDB (strictly read-only)
  const conversations = useLiveQuery(() => listConversations(), []) ?? [];
  const messages = useLiveQuery(
    () =>
      db.messages
        .where('conversationId')
        .equals(activeConversationId)
        .sortBy('timestamp'),
    [activeConversationId]
  ) ?? [];

  const messagesCount = messages.length;

  // 3. Auto-scroll to latest message whenever messages count or loading state updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesCount, isLoading]);

  // 4. Click-outside listener for sessions overflow menu
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

  // Active session title
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const currentTitle = activeConversation?.title ?? APP_CONTENT.chat.defaultSessionTitle;

  // 5. Create a brand new session thread
  const handleNewSession = async () => {
    setErrorNotice(null);
    setIsMenuOpen(false);
    setEditingId(null);
    const newConv = await createConversation();
    setActiveConversationId(newConv.id);
  };

  // 6. Switch session
  const handleSelectSession = (id: string) => {
    setActiveConversationId(id);
    setIsMenuOpen(false);
    setEditingId(null);
  };

  // 7. Start renaming session
  const handleStartRename = (id: string, sessionTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(sessionTitle);
  };

  // 8. Save renamed session
  const handleSaveRename = async (id: string, e?: React.FormEvent | React.MouseEvent) => {
    e?.stopPropagation();
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    await renameConversation(id, trimmed);
    setEditingId(null);
  };

  // 9. Cancel renaming
  const handleCancelRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  // 10. Delete session
  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversation(id);
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        const newConv = await createConversation();
        setActiveConversationId(newConv.id);
      }
    }
  };

  // 11. Send message with multi-turn context and persistent Dexie transactions
  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend ?? input).trim();
    if (!prompt || isLoading) return;

    setErrorNotice(null);
    setInput('');

    const userMessage: ChatMessageRecord = {
      id: generateMessageId('usr'),
      conversationId: activeConversationId,
      role: 'user',
      content: prompt,
      status: 'success',
      timestamp: getNowTimestamp(),
    };

    // Optimistically persist to Dexie (useLiveQuery instantly updates the UI!)
    await saveStoredMessage(userMessage);

    setIsLoading(true);

    try {
      // Send sliding window of past 10 valid messages from this session
      const conversationHistory = messages
        .filter((m) => m.status !== 'error')
        .slice(-10)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Determine if this is the opening message of the session thread
      const isFirstTurn = conversationHistory.length === 0;

      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          mode,
          history: conversationHistory,
          isFirstTurn,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error ?? APP_CONTENT.chat.errorNotice);
      }

      const agentData: AgentResult = json.data;

      // Autonomously assign the agent-generated title to the mission session
      // only if the conversation still holds a default system placeholder title
      if (agentData.sessionTitle) {
        const convRecord = await db.conversations.get(activeConversationId);
        const isDefaultTitle =
          !convRecord ||
          (APP_CONTENT.chat.defaultSessionTitles as readonly string[]).includes(convRecord.title);

        if (isDefaultTitle) {
          await renameConversation(activeConversationId, agentData.sessionTitle);
        }
      }

      const agentMessage: ChatMessageRecord = {
        id: generateMessageId('agt'),
        conversationId: activeConversationId,
        role: 'assistant',
        content: agentData.analysis,
        status: 'success',
        toolCalls: agentData.toolCalls,
        stepCount: agentData.stepCount,
        timestamp: agentData.timestamp,
      };

      await saveStoredMessage(agentMessage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : APP_CONTENT.chat.errorNotice;
      setErrorNotice(msg);

      // Persist durable error message into Dexie to avoid orphaned prompts
      const errorRecord: ChatMessageRecord = {
        id: generateMessageId('err'),
        conversationId: activeConversationId,
        role: 'assistant',
        content: msg,
        status: 'error',
        timestamp: getNowTimestamp(),
      };
      await saveStoredMessage(errorRecord);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setEditingId(null);
  };

  return {
    // State
    activeConversationId,
    currentTitle,
    conversations,
    messages,
    input,
    setInput,
    isLoading,
    errorNotice,
    isMenuOpen,
    setIsMenuOpen,
    editingId,
    setEditingId,
    editTitle,
    setEditTitle,

    // Element Refs
    messagesEndRef,
    menuRef,

    // Action Handlers
    handleToggleMenu,
    handleNewSession,
    handleSelectSession,
    handleStartRename,
    handleSaveRename,
    handleCancelRename,
    handleDeleteSession,
    handleSend,
    handleKeyDown,
  };
}
