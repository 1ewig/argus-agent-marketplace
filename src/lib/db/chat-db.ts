import Dexie, { type EntityTable } from 'dexie';
import type { ExecutedToolCall } from '@/agent';

export interface ChatMessageRecord {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  symbol?: string;
  toolCalls?: ExecutedToolCall[];
  stepCount?: number;
  timestamp: number;
}

/**
 * Dexie IndexedDB Database for Argus persistent chat history and agent telemetry
 */
export class ArgusDatabase extends Dexie {
  messages!: EntityTable<ChatMessageRecord, 'id'>;

  constructor() {
    super('ArgusDatabase');
    this.version(1).stores({
      messages: 'id, symbol, timestamp, role',
    });
  }
}

// Singleton database instance
export const db = new ArgusDatabase();

/**
 * Retrieves stored chat history ordered chronologically
 */
export async function getStoredMessages(symbol?: string): Promise<ChatMessageRecord[]> {
  if (typeof window === 'undefined') return [];
  if (symbol) {
    return db.messages.where('symbol').equals(symbol).sortBy('timestamp');
  }
  return db.messages.orderBy('timestamp').toArray();
}

/**
 * Persists a new chat message into Dexie IndexedDB
 */
export async function saveStoredMessage(msg: ChatMessageRecord): Promise<string> {
  if (typeof window === 'undefined') return msg.id;
  await db.messages.put(msg);
  return msg.id;
}

/**
 * Clears all messages or messages for a specific symbol
 */
export async function clearStoredMessages(symbol?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  if (symbol) {
    await db.messages.where('symbol').equals(symbol).delete();
  } else {
    await db.messages.clear();
  }
}
