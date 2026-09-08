import Dexie, { type EntityTable } from 'dexie';
import { APP_CONTENT } from '@/constants/content';
import type {
  ExecutedToolCall,
  AgentExecutionStep,
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

/**
 * Maximum messages retained per conversation to prevent IndexedDB bloat
 */
export const MAX_MESSAGES_PER_CONVERSATION = 100;
export const DEFAULT_CONVERSATION_ID = 'default';
export const DEFAULT_CONVERSATION_SYMBOL = 'BTCUSDT';
export const DEFAULT_GLOBAL_CONVERSATION_ID = 'default_global';
export const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Default conversation title sourced from centralized UI copy (AGENTS.md Rule 1).
 */
export const DEFAULT_CONVERSATION_TITLE = APP_CONTENT.chat.defaultSessionTitle;

/**
 * Institutional Dexie IndexedDB Database for Argus multi-session chat history,
 * telemetry persistence, and retention pruning.
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
  }
}

// Singleton database instance
export const db = new ArgusDatabase();