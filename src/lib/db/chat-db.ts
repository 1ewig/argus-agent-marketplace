import Dexie, { type EntityTable } from 'dexie';
import type { ExecutedToolCall } from '@/agent';

export interface ConversationRecord {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessageRecord {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  symbol?: string;
  status?: 'success' | 'error' | 'pending';
  toolCalls?: ExecutedToolCall[];
  stepCount?: number;
  timestamp: number;
}

/**
 * Maximum messages retained per conversation to prevent IndexedDB bloat
 */
export const MAX_MESSAGES_PER_CONVERSATION = 100;
export const DEFAULT_CONVERSATION_ID = 'default';

/**
 * Institutional Dexie IndexedDB Database for Argus multi-session chat history,
 * telemetry persistence, and automatic retention pruning.
 */
export class ArgusDatabase extends Dexie {
  conversations!: EntityTable<ConversationRecord, 'id'>;
  messages!: EntityTable<ChatMessageRecord, 'id'>;

  constructor() {
    super('ArgusDatabase');

    // Schema v1: Flat messages
    this.version(1).stores({
      messages: 'id, symbol, timestamp, role',
    });

    // Schema v2: Multi-conversation threads, indexed conversationId and status
    this.version(2).stores({
      conversations: 'id, createdAt, updatedAt',
      messages: 'id, conversationId, symbol, timestamp, role, status',
    }).upgrade(async (tx) => {
      // Gracefully backfill existing records with default conversationId
      const messagesTable = tx.table('messages');
      await messagesTable.toCollection().modify((msg) => {
        if (!msg.conversationId) {
          msg.conversationId = DEFAULT_CONVERSATION_ID;
        }
        if (!msg.status) {
          msg.status = 'success';
        }
      });
    });
  }
}

// Singleton database instance
export const db = new ArgusDatabase();

/**
 * Ensures the default conversation exists
 */
export async function ensureDefaultConversation(): Promise<ConversationRecord> {
  if (typeof window === 'undefined') {
    return {
      id: DEFAULT_CONVERSATION_ID,
      title: 'Active Session',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  const existing = await db.conversations.get(DEFAULT_CONVERSATION_ID);
  if (existing) return existing;

  const defaultConv: ConversationRecord = {
    id: DEFAULT_CONVERSATION_ID,
    title: 'Active Session',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await db.conversations.put(defaultConv);
  return defaultConv;
}

/**
 * Creates a new conversation session
 */
export async function createConversation(title?: string): Promise<ConversationRecord> {
  const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = Date.now();
  const conv: ConversationRecord = {
    id,
    title: title || 'New Mission',
    createdAt: now,
    updatedAt: now,
  };

  if (typeof window !== 'undefined') {
    await db.conversations.put(conv);
  }

  return conv;
}

/**
 * Lists all conversations ordered by latest update (pure read query for useLiveQuery)
 */
export async function listConversations(): Promise<ConversationRecord[]> {
  if (typeof window === 'undefined') return [];
  return db.conversations.orderBy('updatedAt').reverse().toArray();
}

/**
 * Retrieves messages for a specific conversation ordered chronologically
 */
export async function getConversationMessages(conversationId: string): Promise<ChatMessageRecord[]> {
  if (typeof window === 'undefined') return [];
  return db.messages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('timestamp');
}

/**
 * Persists a new chat message into Dexie IndexedDB with auto-title and pruning
 */
export async function saveStoredMessage(msg: ChatMessageRecord): Promise<string> {
  if (typeof window === 'undefined') return msg.id;

  const conversationId = msg.conversationId || DEFAULT_CONVERSATION_ID;
  const normalizedMsg: ChatMessageRecord = {
    ...msg,
    conversationId,
    status: msg.status || 'success',
  };

  // 1. Put message in database
  await db.messages.put(normalizedMsg);

  // 2. Touch conversation updatedAt and update title if it's the first prompt
  const conv = await db.conversations.get(conversationId);
  if (conv) {
    const shouldUpdateTitle = (conv.title === 'Active Session' || conv.title === 'New Mission') && msg.role === 'user';
    const newTitle = shouldUpdateTitle
      ? msg.content.slice(0, 32).trim() + (msg.content.length > 32 ? '...' : '')
      : conv.title;

    await db.conversations.update(conversationId, {
      title: newTitle,
      updatedAt: Date.now(),
    });
  } else {
    await db.conversations.put({
      id: conversationId,
      title: msg.role === 'user' ? msg.content.slice(0, 32) : 'Session',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  // 3. Automatic retention pruning
  void pruneConversationMessages(conversationId, MAX_MESSAGES_PER_CONVERSATION);

  return msg.id;
}

/**
 * Updates an existing message record (e.g. error status or completion)
 */
export async function updateStoredMessage(id: string, updates: Partial<ChatMessageRecord>): Promise<void> {
  if (typeof window === 'undefined') return;
  await db.messages.update(id, updates);
}

/**
 * Prunes older messages exceeding the max retention limit
 */
export async function pruneConversationMessages(
  conversationId: string,
  maxLimit: number = MAX_MESSAGES_PER_CONVERSATION
): Promise<void> {
  if (typeof window === 'undefined') return;

  const count = await db.messages.where('conversationId').equals(conversationId).count();
  if (count > maxLimit) {
    const excess = count - maxLimit;
    const oldest = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .limit(excess)
      .keys();

    await db.messages.bulkDelete(oldest as string[]);
  }
}

/**
 * Clears messages for a given conversation
 */
export async function clearConversationMessages(conversationId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  await db.messages.where('conversationId').equals(conversationId).delete();
}

/**
 * Renames an existing conversation session
 */
export async function renameConversation(conversationId: string, newTitle: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const trimmed = newTitle.trim();
  if (!trimmed) return;
  await db.conversations.update(conversationId, {
    title: trimmed,
    updatedAt: Date.now(),
  });
}

/**
 * Deletes a conversation and all its messages
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  await db.messages.where('conversationId').equals(conversationId).delete();
  await db.conversations.delete(conversationId);
}

/**
 * Backwards-compatible aliases
 */
export async function getStoredMessages(conversationId: string = DEFAULT_CONVERSATION_ID): Promise<ChatMessageRecord[]> {
  return getConversationMessages(conversationId);
}

export async function clearStoredMessages(conversationId: string = DEFAULT_CONVERSATION_ID): Promise<void> {
  return clearConversationMessages(conversationId);
}
