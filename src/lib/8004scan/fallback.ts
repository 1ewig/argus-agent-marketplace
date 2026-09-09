import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  AgentsApiResponse,
  DiscoveryCategory,
  MarketplaceSortKey,
  ScanAgentItem,
} from './types';
import { CATEGORY_DISCOVERY_CONFIG } from './categories';

type FallbackAgent = Pick<
  ScanAgentItem,
  | 'agent_id'
  | 'token_id'
  | 'name'
  | 'description'
  | 'image_url'
  | 'owner_address'
  | 'owner_ens'
  | 'total_score'
  | 'rank'
  | 'health_score'
  | 'total_feedbacks'
  | 'average_score'
  | 'supported_protocols'
  | 'x402_supported'
  | 'created_at'
  | 'updated_at'
> & { categories?: string[] };

export async function loadFallbackData(): Promise<ScanAgentItem[]> {
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

export interface FallbackFilterOptions {
  search?: string;
  category?: DiscoveryCategory | null;
  sort?: MarketplaceSortKey;
  feed?: string;
  limit: number;
  offset: number;
  recentCohortCap?: number;
}

export async function resolveFallbackMarketplace(
  options: FallbackFilterOptions,
): Promise<AgentsApiResponse> {
  const {
    search,
    category,
    sort = 'leaderboard',
    feed = 'all',
    limit,
    offset,
    recentCohortCap = 120,
  } = options;

  const fallbackItems = await loadFallbackData();
  let filtered = [...fallbackItems];

  // 1. Filter by free-text search
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

  // 2. Filter by category
  if (category && CATEGORY_DISCOVERY_CONFIG[category]) {
    const terms = CATEGORY_DISCOVERY_CONFIG[category].searchTerms.map((t: string) => t.toLowerCase());
    filtered = filtered.filter((a) => {
      const text = `${a.name || ''} ${a.description || ''}`.toLowerCase();
      return terms.some((term: string) => text.includes(term));
    });
  }

  // 3. Sort
  if (sort === 'newest' || sort === 'latest') {
    filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } else {
    filtered.sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0));
  }

  let total = filtered.length;
  let sliced = filtered.slice(offset, offset + limit);

  // 4. Cap for 'latest'
  if (sort === 'latest') {
    total = Math.min(filtered.length, recentCohortCap);
    if (offset >= recentCohortCap) {
      sliced = [];
    } else {
      sliced = sliced.slice(0, recentCohortCap - offset);
    }
  }

  return {
    success: true,
    fallback: true,
    feed,
    items: sliced,
    total,
  };
}
