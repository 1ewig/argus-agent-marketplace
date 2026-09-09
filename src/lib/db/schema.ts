import Dexie, { type EntityTable } from 'dexie';
import { APP_CONTENT } from '@/constants/content';
import type {
  ExecutedToolCall,
  AgentExecutionStep,
} from '@/agent';
import type { HiredAgentRecord } from '@/lib/types';

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
  status?: 'success' | 'error' | 'pending';
  followUpQuestions?: string[];
  toolCalls?: ExecutedToolCall[];
  steps?: AgentExecutionStep[];
  stepCount?: number;
  workedDurationMs?: number;
  timestamp: number;
}

export const MAX_MESSAGES_PER_CONVERSATION = 100;
export const DEFAULT_CONVERSATION_ID = 'default';
export const ONE_HOUR_MS = 60 * 60 * 1000;

export const DEFAULT_CONVERSATION_TITLE = APP_CONTENT.chat.defaultSessionTitle;

/**
 * Institutional Dexie IndexedDB Database for Argus multi-session chat history
 * and autonomous hired agents registry.
 */
export class ArgusDatabase extends Dexie {
  conversations!: EntityTable<ConversationRecord, 'id'>;
  messages!: EntityTable<ChatMessageRecord, 'id'>;
  hiredAgents!: EntityTable<HiredAgentRecord, 'id'>;

  constructor() {
    super('ArgusDatabase');

    // Schema v1: Flat messages
    this.version(1).stores({
      messages: 'id, timestamp, role',
    });

    // Schema v2: Multi-conversation threads
    this.version(2).stores({
      conversations: 'id, createdAt, updatedAt',
      messages: 'id, conversationId, timestamp, role, status',
    }).upgrade(async (tx) => {
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

    // Schema v3: Legacy symbol workspaces (kept for migration compatibility)
    this.version(3).stores({
      conversations: 'id, createdAt, updatedAt',
      messages: 'id, conversationId, timestamp, role, status',
    });

    // Schema v4: Hired autonomous agents registry & task logs
    this.version(4).stores({
      conversations: 'id, createdAt, updatedAt',
      messages: 'id, conversationId, timestamp, role, status',
      hiredAgents: 'id, agentTokenId, status, hiredAt, lastActiveAt, categoryKey',
    });
  }
}

export const db = new ArgusDatabase();
