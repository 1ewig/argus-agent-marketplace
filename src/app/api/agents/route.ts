import { NextResponse } from 'next/server';
import {
  getAgentsByCategory,
  getFeaturedAgents,
  getLatestAgents,
  getLeaderboard,
  getSpotlightAgents,
  getTrendingAgents,
  listAgents,
  searchAgents,
} from '@/lib/8004scan/client';
import type { DiscoveryCategory, MarketplaceSortKey, ScanAgentItem } from '@/lib/8004scan/types';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

// In-Memory Server Cache for 8004scan responses
interface CacheEntry {
  timestamp: number;
  payload: unknown;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60-second in-memory TTL

function getCached(key: string) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.timestamp < CACHE_TTL_MS) {
    return hit.payload;
  }
  return null;
}

function setCached(key: string, payload: unknown) {
  if (cache.size > 200) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { timestamp: Date.now(), payload });
}

function respondWithCache(payload: unknown, isHit: boolean) {
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      'X-Cache': isHit ? 'HIT' : 'MISS',
    },
  });
}

type FallbackAgent = Pick<
  ScanAgentItem,
  'agent_id' | 'token_id' | 'name' | 'description' | 'image_url' | 'owner_address' | 'owner_ens' | 'total_score' | 'rank' | 'health_score' | 'total_feedbacks' | 'average_score' | 'supported_protocols' | 'x402_supported' | 'created_at' | 'updated_at'
> & { categories?: string[] };

async function loadFallbackData(): Promise<ScanAgentItem[]> {
  try {
    const filePath = join(process.cwd(), 'scripts', 'data', 'agents-bsc.json');
    const raw = await readFile(filePath, 'utf-8');
    const parsed: FallbackAgent[] = JSON.parse(raw);
    return parsed.map((item) => ({
      id: item.agent_id,
      agent_id: item.agent_id,
      token_id: item.token_id,
      chain_id: 56,
      contract_address: '0x8004A169FB454877eEBb93e8D13F77626F22e3C4',
      name: item.name ?? null,
      description: item.description ?? null,
      image_url: item.image_url ?? null,
      owner_address: item.owner_address,
      owner_ens: item.owner_ens ?? null,
      is_verified: true,
      total_score: item.total_score ?? 0,
      rank: item.rank ?? null,
      health_score: item.health_score ?? null,
      total_feedbacks: item.total_feedbacks ?? 0,
      average_score: item.average_score ?? 0,
      supported_protocols: item.supported_protocols ?? [],
      x402_supported: item.x402_supported ?? false,
      created_at: item.created_at ?? new Date().toISOString(),
      updated_at: item.updated_at ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawFeed = searchParams.get('feed') ?? 'all';
  const category = searchParams.get('category') as DiscoveryCategory | null;
  const sort =
    (searchParams.get('sort') as MarketplaceSortKey | null) ??
    (rawFeed !== 'all' && rawFeed !== 'category' && rawFeed !== 'spotlight' && rawFeed !== 'search'
      ? (rawFeed as MarketplaceSortKey)
      : 'leaderboard');
  const search = searchParams.get('search')?.trim() || '';
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 24, 1), 100);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

  // 1. Check in-memory cache
  const cacheKey = `${category || 'all'}:${sort}:${search}:${limit}:${offset}`;
  const cachedData = getCached(cacheKey);
  if (cachedData) {
    return respondWithCache(cachedData, true);
  }

  const RECENT_COHORT_CAP = 120;

  try {
    // 2. Spotlight request
    if (rawFeed === 'spotlight') {
      const spotlight = await getSpotlightAgents(10);
      const payload = {
        success: true,
        feed: 'spotlight',
        spotlight,
        items: [...spotlight.hevo, ...spotlight.alpha],
        total: spotlight.hevo.length + spotlight.alpha.length,
      };
      setCached(cacheKey, payload);
      return respondWithCache(payload, false);
    }

    // 3. Free-text search
    if (search) {
      const sortBy = sort === 'newest' || sort === 'latest' ? 'created_at' : 'total_score';
      const result = await searchAgents(search, { limit, offset, sortBy, sortOrder: 'desc' });
      const payload = {
        success: true,
        feed: 'search',
        query: search,
        category: category ?? undefined,
        sort,
        items: result.items ?? [],
        total: result.total ?? (result.items ?? []).length,
      };
      setCached(cacheKey, payload);
      return respondWithCache(payload, false);
    }

    // 4. Category-scoped queries (with composable sort)
    if (category) {
      if (sort === 'newest') {
        const result = await getAgentsByCategory(category, {
          limit,
          offset,
          sortBy: 'created_at',
          sortOrder: 'desc',
        });
        const payload = {
          success: true,
          feed: 'category',
          category,
          sort,
          items: result.items ?? [],
          total: result.total ?? (result.items ?? []).length,
        };
        setCached(cacheKey, payload);
        return respondWithCache(payload, false);
      }

      if (sort === 'latest') {
        if (offset >= RECENT_COHORT_CAP) {
          const payload = {
            success: true,
            feed: 'category',
            category,
            sort,
            items: [],
            total: RECENT_COHORT_CAP,
          };
          setCached(cacheKey, payload);
          return respondWithCache(payload, false);
        }

        const effectiveLimit = Math.min(limit, RECENT_COHORT_CAP - offset);
        const result = await getAgentsByCategory(category, {
          limit: effectiveLimit,
          offset,
          sortBy: 'created_at',
          sortOrder: 'desc',
        });
        const items = (result.items ?? []).slice(0, effectiveLimit);
        const total = Math.min(result.total ?? items.length, RECENT_COHORT_CAP);
        const payload = {
          success: true,
          feed: 'category',
          category,
          sort,
          items,
          total,
        };
        setCached(cacheKey, payload);
        return respondWithCache(payload, false);
      }

      // Default category sort: total_score desc (leaderboard / trending / featured)
      const result = await getAgentsByCategory(category, {
        limit,
        offset,
        sortBy: 'total_score',
        sortOrder: 'desc',
      });
      const payload = {
        success: true,
        feed: 'category',
        category,
        sort,
        items: result.items ?? [],
        total: result.total ?? (result.items ?? []).length,
      };
      setCached(cacheKey, payload);
      return respondWithCache(payload, false);
    }

    // 5. Global registry feeds (when no specific category is active)
    if (sort === 'leaderboard') {
      const result = await getLeaderboard(limit, 56, { offset });
      const payload = {
        success: true,
        feed: 'leaderboard',
        sort,
        items: result.items ?? [],
        total: result.total ?? (result.items ?? []).length,
      };
      setCached(cacheKey, payload);
      return respondWithCache(payload, false);
    }

    if (sort === 'trending') {
      const result = await getTrendingAgents(limit, 56, { offset });
      const payload = {
        success: true,
        feed: 'trending',
        sort,
        items: result.items ?? [],
        total: result.total ?? (result.items ?? []).length,
      };
      setCached(cacheKey, payload);
      return respondWithCache(payload, false);
    }

    if (sort === 'featured') {
      const result = await getFeaturedAgents(limit, 56, { offset });
      const payload = {
        success: true,
        feed: 'featured',
        sort,
        items: result.items ?? [],
        total: result.total ?? (result.items ?? []).length,
      };
      setCached(cacheKey, payload);
      return respondWithCache(payload, false);
    }

    if (sort === 'latest') {
      if (offset >= RECENT_COHORT_CAP) {
        const payload = {
          success: true,
          feed: 'latest',
          sort,
          items: [],
          total: RECENT_COHORT_CAP,
        };
        setCached(cacheKey, payload);
        return respondWithCache(payload, false);
      }

      const effectiveLimit = Math.min(limit, RECENT_COHORT_CAP - offset);
      const result = await getLatestAgents(effectiveLimit, offset);
      const items = (result.items ?? []).slice(0, effectiveLimit);
      const payload = {
        success: true,
        feed: 'latest',
        sort,
        items,
        total: RECENT_COHORT_CAP,
      };
      setCached(cacheKey, payload);
      return respondWithCache(payload, false);
    }

    if (sort === 'newest') {
      const result = await getLatestAgents(limit, offset);
      const payload = {
        success: true,
        feed: 'newest',
        sort,
        items: result.items ?? [],
        total: result.total ?? (result.items ?? []).length,
      };
      setCached(cacheKey, payload);
      return respondWithCache(payload, false);
    }

    // 6. Default: Paginated main registry sorted by total_score desc
    const result = await listAgents(limit, offset, 56, 'total_score', 'desc');
    const payload = {
      success: true,
      feed: 'all',
      sort,
      items: result.items ?? [],
      total: result.total ?? 310000,
    };
    setCached(cacheKey, payload);
    return respondWithCache(payload, false);
  } catch (err: unknown) {
    // Graceful offline / fallback recovery
    console.warn('8004scan API request fallback triggered:', err instanceof Error ? err.message : err);
    const fallbackItems = await loadFallbackData();

    let filtered = fallbackItems;
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name?.toLowerCase().includes(lower) ||
          a.description?.toLowerCase().includes(lower) ||
          a.owner_address.toLowerCase().includes(lower) ||
          a.token_id.includes(lower),
      );
    }

    let total = filtered.length;
    let sliced = filtered.slice(offset, offset + limit);

    if (sort === 'latest') {
      const RECENT_COHORT_CAP = 120;
      total = Math.min(filtered.length, RECENT_COHORT_CAP);
      if (offset >= RECENT_COHORT_CAP) {
        sliced = [];
      } else {
        sliced = sliced.slice(0, RECENT_COHORT_CAP - offset);
      }
    }

    const payload = {
      success: true,
      fallback: true,
      feed: rawFeed,
      sort,
      category: category ?? undefined,
      items: sliced,
      total,
    };

    return respondWithCache(payload, false);
  }
}
