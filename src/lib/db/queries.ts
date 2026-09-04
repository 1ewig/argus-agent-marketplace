'use client';

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  listConversations,
  getConversationMessages,
  type ConversationRecord,
  type ChatMessageRecord,
} from './chat-db';

/**
 * Reactive query hook subscribing to the sorted list of conversations in Dexie IndexedDB.
 */
export function useConversations(): ConversationRecord[] {
  const live = useLiveQuery(() => listConversations(), []);
  return useMemo(() => live ?? [], [live]);
}

/**
 * Reactive query hook subscribing to chronological messages for a specific conversation.
 */
export function useMessages(conversationId: string): ChatMessageRecord[] {
  const live = useLiveQuery(
    () => getConversationMessages(conversationId),
    [conversationId]
  );
  return useMemo(() => live ?? [], [live]);
}
