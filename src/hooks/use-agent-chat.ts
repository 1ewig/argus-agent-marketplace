'use client';

import { useCallback } from 'react';
import { APP_CONTENT } from '@/constants/content';
import { generateMessageId, getNowTimestamp } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import {
  getConversation,
  renameConversation,
  saveStoredMessage,
  useMessages,
  type ChatMessageRecord,
} from '@/lib/db';
import { prepareConversationHistory, streamAgentChat } from '@/lib/agents';
import type { AgentResult, AgentExecutionStep } from '@/agent';
import type { ExecutionMode } from '@/lib/types';
import { useChatSessions } from './use-chat-sessions';
import { useChatScroll } from './use-chat-scroll';

const SESSION_TITLE_TAG_REGEX = /<session_title>[\s\S]*?<\/session_title>\s*/gi;
const INCOMPLETE_SESSION_TITLE_TAG_REGEX = /<session_title[\s\S]*$/gi;

export interface UseAgentChatOptions {
  mode?: ExecutionMode;
}

/**
 * Custom hook orchestrating agent chat interaction, Dexie message persistence,
 * and real-time SSE streaming for autonomous Binance Agent OS reasoning steps.
 * 
 * Composes specialized `useChatSessions`, `useChatScroll`, and `useMessages`
 * to maintain strict separation of concerns.
 * 
 * @param options - Execution mode ('simulation')
 * @returns State, refs, and action handlers for the chat console
 */
export function useAgentChat({ mode = 'simulation' }: UseAgentChatOptions = {}) {
  const isLoading = useAppStore((state) => state.isLoading);
  const setIsLoading = useAppStore((state) => state.setIsLoading);
  const activeStreamMessage = useAppStore((state) => state.activeStreamMessage);
  const setActiveStreamMessage = useAppStore((state) => state.setActiveStreamMessage);
  const errorNotice = useAppStore((state) => state.errorNotice);
  const setErrorNotice = useAppStore((state) => state.setErrorNotice);

  // 1. Session and menu management
  const sessions = useChatSessions();
  const { activeConversationId } = sessions;

  // 2. Reactive query for active conversation messages
  const messages = useMessages(activeConversationId);

  const messagesCount = messages.length;
  const streamStepCount = activeStreamMessage?.steps?.length ?? 0;
  const streamContentLength = activeStreamMessage?.content?.length ?? 0;

  // 3. Scroll orchestration with RAF throttling
  const scroll = useChatScroll({
    activeConversationId,
    messagesCount,
    streamStepCount,
    streamContentLength,
    isLoading,
  });

  // 4. Send message with real-time SSE streaming and persistent Dexie transactions
  const handleSend = useCallback(async (textToSend?: string) => {
    const prompt = (textToSend ?? '').trim();
    if (!prompt || isLoading) return;

    setErrorNotice(null);

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

    // Smooth scroll down on user send
    scroll.scrollToBottom(true);

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
              .replace(SESSION_TITLE_TAG_REGEX, '')
              .replace(INCOMPLETE_SESSION_TITLE_TAG_REGEX, '');
            setActiveStreamMessage((prev) =>
              prev ? { ...prev, content: displayContent } : prev
            );
          } else if (event.type === 'clear_text') {
            currentText = '';
            setActiveStreamMessage((prev) =>
              prev ? { ...prev, content: '' } : prev
            );
          } else if (event.type === 'session_title') {
            const convRecord = await getConversation(activeConversationId);
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
        content: finalResult?.analysis ?? currentText.replace(SESSION_TITLE_TAG_REGEX, '').trim(),
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
  }, [
    isLoading,
    activeConversationId,
    mode,
    messages,
    scroll,
    setActiveStreamMessage,
    setIsLoading,
    setErrorNotice,
  ]);

  return {
    // State
    activeConversationId: sessions.activeConversationId,
    currentTitle: sessions.currentTitle,
    conversations: sessions.conversations,
    messages,
    activeStreamMessage,
    isLoading,
    errorNotice,
    isMenuOpen: sessions.isMenuOpen,
    setIsMenuOpen: sessions.setIsMenuOpen,
    editingId: sessions.editingId,
    setEditingId: sessions.setEditingId,
    editTitle: sessions.editTitle,
    setEditTitle: sessions.setEditTitle,

    // Element Refs
    messagesEndRef: scroll.messagesEndRef,
    scrollContainerRef: scroll.scrollContainerRef,
    menuRef: sessions.menuRef,

    // Action Handlers
    handleScroll: scroll.handleScroll,
    handleToggleMenu: sessions.handleToggleMenu,
    handleNewSession: sessions.handleNewSession,
    isNewChatDisabled: sessions.isNewChatDisabled,
    handleSelectSession: sessions.handleSelectSession,
    handleStartRename: sessions.handleStartRename,
    handleSaveRename: sessions.handleSaveRename,
    handleCancelRename: sessions.handleCancelRename,
    handleDeleteSession: sessions.handleDeleteSession,
    handleSend,
  };
}
