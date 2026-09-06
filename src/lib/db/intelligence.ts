import type { MarketIntelligenceResponse } from '@/agent';
import { isGlobalSymbol } from '@/lib/utils';
import { ONE_HOUR_MS, db } from './schema';

/**
 * Synchronous in-memory cache for market intelligence to provide 0ms instant display during session.
 */
const intelligenceCache = new Map<string, MarketIntelligenceResponse>();

export function getCachedIntelligence(symbol: string, maxAgeMs: number = ONE_HOUR_MS): MarketIntelligenceResponse | null {
  const clean = symbol.trim().toUpperCase();
  if (!clean || isGlobalSymbol(clean)) return null;

  const cached = intelligenceCache.get(clean);
  if (cached && typeof cached.timestamp === 'number' && Date.now() - cached.timestamp < maxAgeMs) {
    return cached;
  }

  return null;
}

/**
 * Prewarms the in-memory intelligence cache from Dexie IndexedDB.
 */
export async function prewarmIntelligenceCache(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const all = await db.marketIntelligence.toArray();
    for (const record of all) {
      if (record && record.symbol && Date.now() - record.timestamp < ONE_HOUR_MS) {
        const clean = record.symbol.toUpperCase();
        intelligenceCache.set(clean, record);
      }
    }
  } catch {
    // Graceful handling
  }
}

/**
 * Retrieves the cached market intelligence analysis for a specific trading symbol from Dexie IndexedDB.
 * Checks for validity within maxAgeMs (default: 1 hour).
 */
export async function getStoredIntelligence(
  symbol: string,
  maxAgeMs: number = ONE_HOUR_MS
): Promise<MarketIntelligenceResponse | null> {
  if (typeof window === 'undefined') return null;
  const clean = symbol.trim().toUpperCase();
  if (!clean || isGlobalSymbol(clean)) return null;

  const memoryHit = getCachedIntelligence(clean, maxAgeMs);
  if (memoryHit) return memoryHit;

  try {
    const record = await db.marketIntelligence.get(clean);
    if (record && typeof record.timestamp === 'number' && Date.now() - record.timestamp < maxAgeMs) {
      intelligenceCache.set(clean, record);
      return record;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Persists market intelligence analysis for a specific trading symbol into Dexie IndexedDB.
 */
export async function saveStoredIntelligence(
  data: MarketIntelligenceResponse
): Promise<void> {
  if (typeof window === 'undefined') return;
  const clean = data.symbol.trim().toUpperCase();
  if (!clean || isGlobalSymbol(clean)) return;

  const record: MarketIntelligenceResponse = {
    ...data,
    symbol: clean,
  };

  intelligenceCache.set(clean, record);

  try {
    await db.marketIntelligence.put(record);
  } catch {
    // Gracefully handle storage errors
  }
}