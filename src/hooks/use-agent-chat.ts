'use client';

import { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { APP_CONTENT } from '@/constants/content';
import { generateMessageId, getNowTimestamp } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import {
  db,
  ensureDefaultConversation,
  createConversation,
  deleteConversation,
  renameConversation,
  saveStoredMessage,
  listConversations,
  type ChatMessageRecord,
} from '@/lib/db';
import { prepareConversationHistory, streamAgentChat } from '@/lib/agents';
import type { AgentResult, AgentExecutionStep } from '@/agent';
import type { ExecutionMode } from '@/lib/types';

export interface UseAgentChatOptions {
  mode?: ExecutionMode;
}

/**
 * Custom hook encapsulating session lifecycle management, reactive IndexedDB queries,
 * and real-time SSE streaming for autonomous Binance Agent OS reasoning steps.
 * 
 * Enforces strict separation of concerns by completely decoupling chat orchestration
 * and database state mutations from UI presentation components.
 * 
 * @param options - Execution mode ('simulation' | 'live_mcp')
 * @returns State, refs, and action handlers for the chat console
 */
export function useAgentChat({ mode = 'simulation' }: UseAgentChatOptions = {}) {
  const activeConversationId = useAppStore((state) => state.activeConversationId);
  const setActiveConversationId = useAppStore((state) => state.setActiveConversationId);
  const input = useAppStore((state) => state.input);
  const setInput = useAppStore((state) => state.setInput);
  const isLoading = useAppStore((state) => state.isLoading);
  const setIsLoading = useAppStore((state) => state.setIsLoading);
  const activeStreamMessage = useAppStore((state) => state.activeStreamMessage);
  const setActiveStreamMessage = useAppStore((state) => state.setActiveStreamMessage);
  const errorNotice = useAppStore((state) => state.errorNotice);
  const setErrorNotice = useAppStore((state) => state.setErrorNotice);

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
  const streamStepCount = activeStreamMessage?.steps?.length ?? 0;
  const streamContentLength = activeStreamMessage?.content?.length ?? 0;

  // 3. Auto-scroll whenever messages, loading state, or active stream updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesCount, isLoading, streamStepCount, streamContentLength]);

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
    setActiveStreamMessage(null);
    const newConv = await createConversation();
    setActiveConversationId(newConv.id);
  };

  // 6. Switch session
  const handleSelectSession = (id: string) => {
    setActiveConversationId(id);
    setIsMenuOpen(false);
    setEditingId(null);
    setActiveStreamMessage(null);
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

  // 11. Send message with real-time SSE streaming and persistent Dexie transactions
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

    // Optimistically persist user prompt to Dexie
    await saveStoredMessage(userMessage);

    const streamMessageId = generateMessageId('agt');
    const initialStreamRecord: ChatMessageRecord = {
      id: streamMessageId,
      conversationId: activeConversationId,
      role: 'assistant',
      content: '',
      status: 'pending',
      steps: [],
      timestamp: getNowTimestamp(),
    };

    setActiveStreamMessage(initialStreamRecord);
    setIsLoading(true);

    try {
      const conversationHistory = prepareConversationHistory(messages);
      const isFirstTurn = conversationHistory.length === 0;

      let currentSteps: AgentExecutionStep[] = [];
      let currentText = '';

      const finalResult: AgentResult | null = await streamAgentChat({
        message: prompt,
        mode,
        history: conversationHistory,
        isFirstTurn,
        onEvent: async (event) => {
          if (event.type === 'step_start') {
            currentSteps = [...currentSteps, event.step];
            setActiveStreamMessage((prev) =>
              prev ? { ...prev, steps: currentSteps } : prev
            );
          } else if (event.type === 'step_update') {
            currentSteps = currentSteps.map((s) =>
              s.id === event.stepId
                ? {
                    ...s,
                    ...(event.status ? { status: event.status } : {}),
                    ...(event.durationMs !== undefined ? { durationMs: event.durationMs } : {}),
                    ...(event.label ? { label: event.label } : {}),
                    ...(event.reasoningText !== undefined ? { reasoningText: event.reasoningText } : {}),
                    ...(event.toolArgs !== undefined ? { toolArgs: event.toolArgs } : {}),
                    ...(event.toolResult !== undefined ? { toolResult: event.toolResult } : {}),
                  }
                : s
            );
            setActiveStreamMessage((prev) =>
              prev ? { ...prev, steps: currentSteps } : prev
            );
          } else if (event.type === 'reasoning_delta') {
            currentSteps = currentSteps.map((s) =>
              s.id === event.stepId
                ? { ...s, reasoningText: (s.reasoningText ?? '') + event.delta }
                : s
            );
            setActiveStreamMessage((prev) =>
              prev ? { ...prev, steps: currentSteps } : prev
            );
          } else if (event.type === 'text_delta') {
            currentText += event.delta;
            // Strip any complete or in-progress session_title markup from live markdown display
            const displayContent = currentText
              .replace(/<session_title>[\s\S]*?<\/session_title>\s*/gi, '')
              .replace(/<session_title[\s\S]*$/gi, '');
            setActiveStreamMessage((prev) =>
              prev ? { ...prev, content: displayContent } : prev
            );
          } else if (event.type === 'clear_text') {
            currentText = '';
            setActiveStreamMessage((prev) =>
              prev ? { ...prev, content: '' } : prev
            );
          } else if (event.type === 'session_title') {
            const convRecord = await db.conversations.get(activeConversationId);
            const isDefaultTitle =
              !convRecord ||
              (APP_CONTENT.chat.defaultSessionTitles as readonly string[]).includes(convRecord.title);

            if (isDefaultTitle) {
              await renameConversation(activeConversationId, event.title);
            }
          } else if (event.type === 'error') {
            throw new Error(event.message);
          }
        },
      });

      // Finalize and persist completed agent message into Dexie
      const finalMessage: ChatMessageRecord = {
        id: streamMessageId,
        conversationId: activeConversationId,
        role: 'assistant',
        content: finalResult?.analysis ?? currentText.replace(/<session_title>[\s\S]*?<\/session_title>\s*/gi, '').trim(),
        status: 'success',
        toolCalls: finalResult?.toolCalls,
        steps: finalResult?.steps ?? currentSteps,
        stepCount: finalResult?.stepCount ?? currentSteps.length,
        workedDurationMs: finalResult?.workedDurationMs,
        timestamp: finalResult?.timestamp ?? getNowTimestamp(),
      };

      await saveStoredMessage(finalMessage);
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
      setActiveStreamMessage(null);
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
    activeStreamMessage,
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
