import { NextResponse } from 'next/server';

export interface CacheEntry {
  timestamp: number;
  payload: unknown;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60-second in-memory TTL
const MAX_CACHE_ENTRIES = 200;

export function getCached<T = unknown>(key: string): T | null {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.timestamp < CACHE_TTL_MS) {
    return hit.payload as T;
  }
  return null;
}

export function setCached(key: string, payload: unknown): void {
  if (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { timestamp: Date.now(), payload });
}

export function clearCache(): void {
  cache.clear();
}

export function respondWithCache(payload: unknown, isHit: boolean): NextResponse {
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      'X-Cache': isHit ? 'HIT' : 'MISS',
    },
  });
}
