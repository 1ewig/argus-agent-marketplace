import Dexie, { type EntityTable } from 'dexie';
import { normalizeSymbolForDisplay } from '@/lib/symbols';
import type {
  ExecutedToolCall,
  AgentExecutionStep,
  MarketIntelligencePayload,
  MarketIntelligenceResponse,
} from '@/agent';

export interface ConversationRecord {
  id: string;
  title: string;
  symbol: string; // e.g. "BTCUSDT", "SOLUSDT"
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
  followUpQuestions?: string[];
  toolCalls?: ExecutedToolCall[];
  steps?: AgentExecutionStep[];
  stepCount?: number;
  workedDurationMs?: number;
  timestamp: number;
}

export interface MarketIntelligenceRecord {
  symbol: string; // e.g. "BTCUSDT" (Primary Key)
  timestamp: number;
  data: MarketIntelligencePayload;
  newsCount: number;
  sources: string[];
}

/**
 * Normalizes a ChatMessageRecord's steps for presentation.
 * Backwards-compatible with legacy messages that only have toolCalls.
 */
export function normalizeMessageSteps(
  message: Pick<ChatMessageRecord, 'id' | 'steps' | 'toolCalls' | 'timestamp'>,
  _fallbackThinkingLabel: string,
  isStreaming: boolean = false
): AgentExecutionStep[] {
  if (message.steps && message.steps.length > 0) {
    return message.steps
      .filter(
        (s) =>
          s.type !== 'thinking' ||
          Boolean(s.reasoningText?.trim()) ||
          (isStreaming && s.status === 'active')
      )
      .map((s) => {
        // Guard against any step stuck in 'active' from prior interruptions or errors on persisted historical messages
        if (s.status === 'active' && !isStreaming) {
          return {
            ...s,
            status: s.toolResult ? ('completed' as const) : ('error' as const),
            toolResult: s.toolResult ?? {
              success: false,
              error: 'Tool execution was interrupted or failed',
            },
          };
        }
        return s;
      });
  }
  if (message.toolCalls && message.toolCalls.length > 0) {
    return message.toolCalls.map((t, idx) => ({
      id: `step_legacy_tool_${message.id}_${idx}`,
      type: 'tool' as const,
      toolName: t.toolName,
      label: t.toolName,
      status: 'completed' as const,
      timestamp: message.timestamp,
    }));
  }
  return [];
}

import { GLOBAL_WORKSPACE_SYMBOL, isGlobalSymbol } from '@/lib/utils';
export { GLOBAL_WORKSPACE_SYMBOL, isGlobalSymbol };

/**
 * Maximum messages retained per conversation to prevent IndexedDB bloat
 */
export const MAX_MESSAGES_PER_CONVERSATION = 100;
export const DEFAULT_CONVERSATION_ID = 'default';
export const DEFAULT_CONVERSATION_SYMBOL = 'BTCUSDT';
export const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Institutional Dexie IndexedDB Database for Argus multi-session chat history,
 * telemetry persistence, symbol-specific market intelligence snapshots, and retention pruning.
 */
export class ArgusDatabase extends Dexie {
  conversations!: EntityTable<ConversationRecord, 'id'>;
  messages!: EntityTable<ChatMessageRecord, 'id'>;
  marketIntelligence!: EntityTable<MarketIntelligenceRecord, 'symbol'>;

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

    // Schema v3: Symbol workspaces and indexed symbol groups
    this.version(3).stores({
      conversations: 'id, symbol, createdAt, updatedAt',
      messages: 'id, conversationId, symbol, timestamp, role, status',
    }).upgrade(async (tx) => {
      const convsTable = tx.table('conversations');
      await convsTable.toCollection().modify((conv) => {
        if (!conv.symbol) {
          conv.symbol = DEFAULT_CONVERSATION_SYMBOL;
        }
      });
    });

    // Schema v4: Symbol-specific Market Intelligence snapshots
    this.version(4).stores({
      conversations: 'id, symbol, createdAt, updatedAt',
      messages: 'id, conversationId, symbol, timestamp, role, status',
      marketIntelligence: 'symbol, timestamp',
    });
  }
}

// Singleton database instance
export const db = new ArgusDatabase();

/**
 * Synchronous in-memory cache for market intelligence to provide 0ms instant display.
 */
const intelligenceCache = new Map<string, MarketIntelligenceResponse>();

export function getCachedIntelligence(symbol: string, maxAgeMs: number = ONE_HOUR_MS): MarketIntelligenceResponse | null {
  const clean = symbol.trim().toUpperCase();
  if (!clean || clean === 'GLOBAL') return null;

  const cached = intelligenceCache.get(clean);
  if (cached && typeof cached.timestamp === 'number' && Date.now() - cached.timestamp < maxAgeMs) {
    return cached;
  }

  // Check synchronous localStorage for instant 0ms retrieval on page refresh
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`argus_intel_${clean}`);
      if (raw) {
        const parsed = JSON.parse(raw) as MarketIntelligenceResponse;
        if (parsed && typeof parsed.timestamp === 'number' && Date.now() - parsed.timestamp < maxAgeMs) {
          intelligenceCache.set(clean, parsed);
          return parsed;
        }
      }
    } catch {
      // Ignore JSON or localStorage access error
    }
  }

  return null;
}

/**
 * Prewarms the in-memory intelligence cache from Dexie IndexedDB and localStorage.
 */
export async function prewarmIntelligenceCache(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const all = await db.marketIntelligence.toArray();
    for (const record of all) {
      if (record && record.symbol && Date.now() - record.timestamp < ONE_HOUR_MS) {
        const clean = record.symbol.toUpperCase();
        intelligenceCache.set(clean, record);
        try {
          localStorage.setItem(`argus_intel_${clean}`, JSON.stringify(record));
        } catch {
          // Ignore storage quota error
        }
      }
    }
  } catch {
    // Graceful handling
  }
}

/**
 * Retrieves the cached market intelligence analysis for a specific trading symbol from Dexie or localStorage.
 * Checks for validity within maxAgeMs (default: 1 hour).
 */
export async function getStoredIntelligence(
  symbol: string,
  maxAgeMs: number = ONE_HOUR_MS
): Promise<MarketIntelligenceResponse | null> {
  if (typeof window === 'undefined') return null;
  const clean = symbol.trim().toUpperCase();
  if (!clean || clean === 'GLOBAL') return null;

  const memoryHit = getCachedIntelligence(clean, maxAgeMs);
  if (memoryHit) return memoryHit;

  try {
    const record = await db.marketIntelligence.get(clean);
    if (record && typeof record.timestamp === 'number' && Date.now() - record.timestamp < maxAgeMs) {
      intelligenceCache.set(clean, record);
      try {
        localStorage.setItem(`argus_intel_${clean}`, JSON.stringify(record));
      } catch {
        // Ignore storage quota error
      }
      return record;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Persists market intelligence analysis for a specific trading symbol into Dexie IndexedDB and localStorage.
 */
export async function saveStoredIntelligence(
  data: MarketIntelligenceResponse
): Promise<void> {
  if (typeof window === 'undefined') return;
  const clean = data.symbol.trim().toUpperCase();
  if (!clean || clean === 'GLOBAL') return;

  const record: MarketIntelligenceResponse = {
    ...data,
    symbol: clean,
  };

  intelligenceCache.set(clean, record);

  try {
    localStorage.setItem(`argus_intel_${clean}`, JSON.stringify(record));
  } catch {
    // Gracefully handle localStorage quota errors
  }

  try {
    await db.marketIntelligence.put(record);
  } catch {
    // Gracefully handle storage errors
  }
}

/**
 * Ensures the default conversation exists
 */
export async function ensureDefaultConversation(symbol: string = DEFAULT_CONVERSATION_SYMBOL): Promise<ConversationRecord> {
  if (typeof window === 'undefined') {
    return {
      id: DEFAULT_CONVERSATION_ID,
      title: 'New Chat',
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
    title: 'New Chat',
    symbol,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await db.conversations.put(defaultConv);
  return defaultConv;
}

export const DEFAULT_GLOBAL_CONVERSATION_ID = 'default_global';

/**
 * Ensures a permanent default conversation exists for the Global Workspace ('GLOBAL').
 */
export async function ensureDefaultGlobalConversation(): Promise<ConversationRecord> {
  if (typeof window === 'undefined') {
    return {
      id: DEFAULT_GLOBAL_CONVERSATION_ID,
      title: 'New Chat',
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
    title: 'New Chat',
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
    title: title || 'New Chat',
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
 * Counts messages for a specific conversation
 */
export async function getConversationMessageCount(conversationId: string): Promise<number> {
  if (typeof window === 'undefined') return 0;
  return db.messages.where('conversationId').equals(conversationId).count();
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

  // 2. Touch conversation updatedAt
  const conv = await db.conversations.get(conversationId);
  if (conv) {
    const count = await db.messages.where('conversationId').equals(conversationId).count();
    const updates: Partial<ConversationRecord> = {
      updatedAt: Date.now(),
    };
    if (count <= 1 && msg.symbol && conv.symbol !== msg.symbol) {
      updates.symbol = msg.symbol;
    }
    await db.conversations.update(conversationId, updates);
  } else {
    await db.conversations.put({
      id: conversationId,
      title: 'New Chat',
      symbol: msg.symbol || DEFAULT_CONVERSATION_SYMBOL,
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
