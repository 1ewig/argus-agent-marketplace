import {
  getAgentsByCategory,
  getFeaturedAgents,
  getLatestAgents,
  getLeaderboard,
  getSpotlightAgents,
  getTrendingAgents,
  listAgents,
  searchAgents,
} from './client';
import { resolveFallbackMarketplace } from './fallback';
import type {
  AgentsApiResponse,
  DiscoveryCategory,
  MarketplaceSortKey,
} from './types';

export const RECENT_COHORT_CAP = 120;

export interface MarketplaceQueryParams {
  rawFeed: string;
  category: DiscoveryCategory | null;
  sort: MarketplaceSortKey;
  search: string;
  limit: number;
  offset: number;
  cacheKey: string;
}

export function parseAgentQueryParams(urlString: string): MarketplaceQueryParams {
  const { searchParams } = new URL(urlString);
  const rawFeed = searchParams.get('feed') ?? 'all';
  const category = searchParams.get('category') as DiscoveryCategory | null;
  const sort =
    (searchParams.get('sort') as MarketplaceSortKey | null) ??
    (rawFeed !== 'all' && rawFeed !== 'category' && rawFeed !== 'spotlight' && rawFeed !== 'search'
      ? (rawFeed as MarketplaceSortKey)
      : 'newest');
  const search = searchParams.get('search')?.trim() || '';
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 24, 1), 100);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

  const cacheKey = `${category || 'all'}:${sort}:${search}:${limit}:${offset}`;

  return {
    rawFeed,
    category,
    sort,
    search,
    limit,
    offset,
    cacheKey,
  };
}

export async function resolveMarketplaceAgents(
  params: MarketplaceQueryParams,
): Promise<AgentsApiResponse> {
  const { rawFeed, category, sort, search, limit, offset } = params;

  try {
    // 1. Spotlight request
    if (rawFeed === 'spotlight') {
      const spotlight = await getSpotlightAgents(10);
      return {
        success: true,
        feed: 'spotlight',
        spotlight,
        items: [...spotlight.hevo, ...spotlight.alpha],
        total: spotlight.hevo.length + spotlight.alpha.length,
      };
    }

    // 2. Free-text search
    if (search) {
      const sortBy = sort === 'newest' || sort === 'latest' ? 'created_at' : 'total_score';
      const result = await searchAgents(search, { limit, offset, sortBy, sortOrder: 'desc' });
      return {
        success: true,
        feed: 'search',
        query: search,
        category: category ?? undefined,
        sort,
        items: result.items ?? [],
        total: result.total ?? (result.items ?? []).length,
      };
    }

    // 3. Category-scoped queries (with composable sort)
    if (category) {
      if (sort === 'newest') {
        const result = await getAgentsByCategory(category, {
          limit,
          offset,
          sortBy: 'created_at',
          sortOrder: 'desc',
        });
        return {
          success: true,
          feed: 'category',
          category,
          sort,
          items: result.items ?? [],
          total: result.total ?? (result.items ?? []).length,
        };
      }

      if (sort === 'latest') {
        if (offset >= RECENT_COHORT_CAP) {
          return {
            success: true,
            feed: 'category',
            category,
            sort,
            items: [],
            total: RECENT_COHORT_CAP,
          };
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
        return {
          success: true,
          feed: 'category',
          category,
          sort,
          items,
          total,
        };
      }

      // Default category sort: total_score desc (leaderboard / trending / featured)
      const result = await getAgentsByCategory(category, {
        limit,
        offset,
        sortBy: 'total_score',
        sortOrder: 'desc',
      });
      return {
        success: true,
        feed: 'category',
        category,
        sort,
        items: result.items ?? [],
        total: result.total ?? (result.items ?? []).length,
      };
    }

    // 4. Global registry feeds (when no category is active)
    if (sort === 'leaderboard') {
      const result = await getLeaderboard(limit, 56, { offset });
      return {
        success: true,
        feed: 'leaderboard',
        sort,
        items: result.items ?? [],
        total: result.total ?? (result.items ?? []).length,
      };
    }

    if (sort === 'trending') {
      const result = await getTrendingAgents(limit, 56, { offset });
      return {
        success: true,
        feed: 'trending',
        sort,
        items: result.items ?? [],
        total: result.total ?? (result.items ?? []).length,
      };
    }

    if (sort === 'featured') {
      const result = await getFeaturedAgents(limit, 56, { offset });
      return {
        success: true,
        feed: 'featured',
        sort,
        items: result.items ?? [],
        total: result.total ?? (result.items ?? []).length,
      };
    }

    if (sort === 'latest') {
      if (offset >= RECENT_COHORT_CAP) {
        return {
          success: true,
          feed: 'latest',
          sort,
          items: [],
          total: RECENT_COHORT_CAP,
        };
      }

      const effectiveLimit = Math.min(limit, RECENT_COHORT_CAP - offset);
      const result = await getLatestAgents(effectiveLimit, offset);
      const items = (result.items ?? []).slice(0, effectiveLimit);
      return {
        success: true,
        feed: 'latest',
        sort,
        items,
        total: RECENT_COHORT_CAP,
      };
    }

    if (sort === 'newest') {
      const result = await getLatestAgents(limit, offset);
      return {
        success: true,
        feed: 'newest',
        sort,
        items: result.items ?? [],
        total: result.total ?? (result.items ?? []).length,
      };
    }

    // Default: Paginated main registry sorted by total_score desc
    const result = await listAgents(limit, offset, 56, 'total_score', 'desc');
    return {
      success: true,
      feed: 'all',
      sort,
      items: result.items ?? [],
      total: result.total ?? 310000,
    };
  } catch (err: unknown) {
    console.warn(
      '8004scan API request fallback triggered:',
      err instanceof Error ? err.message : err,
    );

    return resolveFallbackMarketplace({
      search,
      category,
      sort,
      feed: rawFeed,
      limit,
      offset,
      recentCohortCap: RECENT_COHORT_CAP,
    });
  }
}
