import { normalizeSymbolForDisplay } from '@/lib/symbols';
import { GLOBAL_WORKSPACE_SYMBOL, isGlobalSymbol } from '@/lib/utils';
import {
  DEFAULT_CONVERSATION_ID,
  DEFAULT_CONVERSATION_SYMBOL,
  DEFAULT_CONVERSATION_TITLE,
  DEFAULT_GLOBAL_CONVERSATION_ID,
  type ConversationRecord,
  db,
} from './schema';

/**
 * Ensures the default conversation exists
 */
export async function ensureDefaultConversation(symbol: string = DEFAULT_CONVERSATION_SYMBOL): Promise<ConversationRecord> {
  if (typeof window === 'undefined') {
    return {
      id: DEFAULT_CONVERSATION_ID,
      title: DEFAULT_CONVERSATION_TITLE,
      symbol,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  const existing = await db.conversations.get(DEFAULT_CONVERSATION_ID);
  if (existing) {
    if (!existing.symbol) {
      existing.symbol = symbol;
      await db.conversations.update(DEFAULT_CONVERSATION_ID, { symbol });
    }
    return existing;
  }

  const defaultConv: ConversationRecord = {
    id: DEFAULT_CONVERSATION_ID,
    title: DEFAULT_CONVERSATION_TITLE,
    symbol,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await db.conversations.put(defaultConv);
  return defaultConv;
}

/**
 * Ensures a permanent default conversation exists for the Global Workspace ('GLOBAL').
 */
export async function ensureDefaultGlobalConversation(): Promise<ConversationRecord> {
  if (typeof window === 'undefined') {
    return {
      id: DEFAULT_GLOBAL_CONVERSATION_ID,
      title: DEFAULT_CONVERSATION_TITLE,
      symbol: GLOBAL_WORKSPACE_SYMBOL,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  const existing = await db.conversations.get(DEFAULT_GLOBAL_CONVERSATION_ID);
  if (existing) {
    return existing;
  }

  const allConvs = await db.conversations.toArray();
  const existingGlobal = allConvs.find(
    (c) => isGlobalSymbol(c.symbol)
  );
  if (existingGlobal) {
    return existingGlobal;
  }

  const defaultConv: ConversationRecord = {
    id: DEFAULT_GLOBAL_CONVERSATION_ID,
    title: DEFAULT_CONVERSATION_TITLE,
    symbol: GLOBAL_WORKSPACE_SYMBOL,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await db.conversations.put(defaultConv);
  return defaultConv;
}

/**
 * Creates a new conversation session
 */
export async function createConversation(
  title?: string,
  symbol: string = DEFAULT_CONVERSATION_SYMBOL
): Promise<ConversationRecord> {
  const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = Date.now();
  const conv: ConversationRecord = {
    id,
    title: title || DEFAULT_CONVERSATION_TITLE,
    symbol,
    createdAt: now,
    updatedAt: now,
  };

  if (typeof window !== 'undefined') {
    await db.conversations.put(conv);
  }

  return conv;
}

/**
 * Resolves the most recently active conversation for a given symbol,
 * or creates a fresh conversation if none exists.
 */
export async function openOrCreateConversationForSymbol(
  rawSymbol?: string | null
): Promise<string> {
  const targetSymbol = normalizeSymbolForDisplay(rawSymbol) || DEFAULT_CONVERSATION_SYMBOL;

  if (isGlobalSymbol(targetSymbol)) {
    const globalConv = await ensureDefaultGlobalConversation();
    return globalConv.id;
  }

  const all = await listConversations();
  const matching = all.filter(
    (c) => normalizeSymbolForDisplay(c.symbol) === targetSymbol
  );

  if (matching.length > 0) {
    const sorted = [...matching].sort(
      (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
    );
    return sorted[0].id;
  }

  const newConv = await createConversation(undefined, targetSymbol);
  return newConv.id;
}

/**
 * Lists all conversations ordered by creation time descending (newest created first)
 */
export async function listConversations(): Promise<ConversationRecord[]> {
  if (typeof window === 'undefined') return [];
  const records = await db.conversations.toArray();
  return records.sort(
    (a, b) => (b.createdAt || b.updatedAt || 0) - (a.createdAt || a.updatedAt || 0)
  );
}

/**
 * Retrieves a single conversation by its ID
 */
export async function getConversation(conversationId: string): Promise<ConversationRecord | undefined> {
  if (typeof window === 'undefined') return undefined;
  return db.conversations.get(conversationId);
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