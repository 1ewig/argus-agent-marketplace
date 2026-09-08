import type {
  CategoryQueryResult,
  DiscoveryCategory,
  ScanAgentItem,
  ScanAgentListResponse,
} from './types';
import { CATEGORY_DISCOVERY_CONFIG } from './categories';

const BASE_URL = 'https://api.8004scan.io/api/v1';
const BSC_CHAIN_ID = 56;
const DEFAULT_REVALIDATE_SECONDS = 30;

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'Argus-Discovery/1.0',
  };
  const apiKey = process.env['SCAN8004_API_KEY'] || process.env['8004SCAN_API_KEY'];
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  return headers;
}

export interface DiscoveryOptions {
  limit?: number;
  offset?: number;
  revalidate?: number;
  sortBy?: string;
  sortOrder?: string;
}

export async function getAgentsByCategory(
  category: DiscoveryCategory,
  options: DiscoveryOptions = {},
): Promise<ScanAgentListResponse> {
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;
  const revalidate = options.revalidate ?? DEFAULT_REVALIDATE_SECONDS;
  const config = CATEGORY_DISCOVERY_CONFIG[category];
  if (!config) {
    throw new Error(`Unknown discovery category: ${category}`);
  }

  const params = new URLSearchParams({
    search: config.query,
    chain_id: String(BSC_CHAIN_ID),
    limit: String(limit),
    offset: String(offset),
  });

  if (options.sortBy) {
    params.set('sort_by', options.sortBy);
    params.set('sort_order', options.sortOrder ?? 'desc');
  } else if (config.defaultSort === 'score') {
    params.set('sort_by', 'total_score');
    params.set('sort_order', 'desc');
  }

  const res = await fetch(`${BASE_URL}/agents?${params.toString()}`, {
    headers: getHeaders(),
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`8004scan category discovery error (${res.status}): ${res.statusText}`);
  }

  return res.json() as Promise<ScanAgentListResponse>;
}

export async function listAgents(
  limit = 24,
  offset = 0,
  chainId = BSC_CHAIN_ID,
  sortBy?: string,
  sortOrder?: string,
  options: DiscoveryOptions = {},
): Promise<ScanAgentListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    chain_id: String(chainId),
  });

  if (sortBy) {
    params.set('sort_by', sortBy);
    params.set('sort_order', sortOrder ?? 'desc');
  }

  const res = await fetch(`${BASE_URL}/agents?${params.toString()}`, {
    headers: getHeaders(),
    next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`8004scan listAgents error (${res.status}): ${res.statusText}`);
  }

  return res.json() as Promise<ScanAgentListResponse>;
}

export async function getLeaderboard(
  limit = 24,
  chainId = BSC_CHAIN_ID,
  options: DiscoveryOptions = {},
): Promise<ScanAgentListResponse> {
  const offset = options.offset ?? 0;
  const params = new URLSearchParams({
    limit: String(Math.max(limit, offset + limit)),
    chain_id: String(chainId),
  });

  if (options.offset) {
    params.set('offset', String(options.offset));
  }

  const res = await fetch(`${BASE_URL}/agents/leaderboard?${params.toString()}`, {
    headers: getHeaders(),
    next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`8004scan leaderboard error (${res.status}): ${res.statusText}`);
  }

  const data = (await res.json()) as ScanAgentListResponse;
  const items = data.items ?? [];
  const sliced = items.length > limit ? items.slice(offset, offset + limit) : items;

  return {
    ...data,
    items: sliced,
    total: data.total ?? items.length,
    limit,
    offset,
  };
}

export async function getTrendingAgents(
  limit = 24,
  chainId = BSC_CHAIN_ID,
  options: DiscoveryOptions = {},
): Promise<ScanAgentListResponse> {
  const offset = options.offset ?? 0;
  const params = new URLSearchParams({
    limit: String(Math.max(limit, offset + limit)),
    chain_id: String(chainId),
  });

  if (options.offset) {
    params.set('offset', String(options.offset));
  }

  const res = await fetch(`${BASE_URL}/agents/trending?${params.toString()}`, {
    headers: getHeaders(),
    next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`8004scan trending error (${res.status}): ${res.statusText}`);
  }

  const data = (await res.json()) as ScanAgentListResponse;
  const items = data.items ?? [];
  const sliced = items.length > limit ? items.slice(offset, offset + limit) : items;

  return {
    ...data,
    items: sliced,
    total: data.total ?? items.length,
    limit,
    offset,
  };
}

export async function getFeaturedAgents(
  limit = 24,
  chainId = BSC_CHAIN_ID,
  options: DiscoveryOptions = {},
): Promise<ScanAgentListResponse> {
  const offset = options.offset ?? 0;
  const params = new URLSearchParams({
    limit: String(Math.max(limit, offset + limit)),
    chain_id: String(chainId),
  });

  if (options.offset) {
    params.set('offset', String(options.offset));
  }

  const res = await fetch(`${BASE_URL}/agents/featured?${params.toString()}`, {
    headers: getHeaders(),
    next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`8004scan featured error (${res.status}): ${res.statusText}`);
  }

  const data = (await res.json()) as ScanAgentListResponse;
  const items = data.items ?? [];
  const sliced = items.length > limit ? items.slice(offset, offset + limit) : items;

  return {
    ...data,
    items: sliced,
    total: data.total ?? items.length,
    limit,
    offset,
  };
}

export async function getLatestAgents(
  limit = 20,
  offset = 0,
  chainId = BSC_CHAIN_ID,
  options: DiscoveryOptions = {},
): Promise<ScanAgentListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    chain_id: String(chainId),
  });

  const res = await fetch(`${BASE_URL}/agents/latest?${params.toString()}`, {
    headers: getHeaders(),
    next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`8004scan latest error (${res.status}): ${res.statusText}`);
  }

  return res.json() as Promise<ScanAgentListResponse>;
}

export async function getAgentDetail(
  tokenId: string,
  chainId = BSC_CHAIN_ID,
  revalidate = 60,
): Promise<ScanAgentItem> {
  const res = await fetch(`${BASE_URL}/agents/${chainId}/${tokenId}`, {
    headers: getHeaders(),
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`8004scan agent detail error (${res.status}): ${res.statusText}`);
  }

  return res.json() as Promise<ScanAgentItem>;
}

export async function fetchAllCategories(
  limit = 8,
  options: DiscoveryOptions = {},
): Promise<CategoryQueryResult[]> {
  const categories = Object.entries(CATEGORY_DISCOVERY_CONFIG) as [
    DiscoveryCategory,
    { query: string; label: string },
  ][];

  const requests = categories.map(async ([key, config]): Promise<CategoryQueryResult> => {
    try {
      const data = await getAgentsByCategory(key, { ...options, limit });
      return {
        key,
        label: config.label,
        total: data.total ?? 0,
        agents: data.items ?? [],
      };
    } catch {
      return {
        key,
        label: config.label,
        total: 0,
        agents: [],
        error: true,
      };
    }
  });

  return Promise.all(requests);
}

export async function getSpotlightAgents(
  limit = 10,
  options: DiscoveryOptions = {},
): Promise<{ hevo: ScanAgentItem[]; alpha: ScanAgentItem[] }> {
  const [hevoRes, alphaRes] = await Promise.allSettled([
    fetch(
      `${BASE_URL}/agents?search=Hevo&chain_id=${BSC_CHAIN_ID}&limit=${limit}`,
      {
        headers: getHeaders(),
        next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS },
      },
    ).then((r) => r.json() as Promise<ScanAgentListResponse>),
    fetch(
      `${BASE_URL}/agents?search=4LPHA&chain_id=${BSC_CHAIN_ID}&limit=${limit}`,
      {
        headers: getHeaders(),
        next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS },
      },
    ).then((r) => r.json() as Promise<ScanAgentListResponse>),
  ]);

  return {
    hevo: hevoRes.status === 'fulfilled' ? (hevoRes.value.items ?? []) : [],
    alpha: alphaRes.status === 'fulfilled' ? (alphaRes.value.items ?? []) : [],
  };
}

export async function searchAgents(
  query: string,
  options: DiscoveryOptions = {},
): Promise<ScanAgentListResponse> {
  const limit = options.limit ?? 24;
  const offset = options.offset ?? 0;
  const revalidate = options.revalidate ?? DEFAULT_REVALIDATE_SECONDS;

  const params = new URLSearchParams({
    search: query,
    chain_id: String(BSC_CHAIN_ID),
    limit: String(limit),
    offset: String(offset),
  });

  if (options.sortBy) {
    params.set('sort_by', options.sortBy);
    params.set('sort_order', options.sortOrder ?? 'desc');
  }

  const res = await fetch(`${BASE_URL}/agents?${params.toString()}`, {
    headers: getHeaders(),
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`8004scan search error (${res.status}): ${res.statusText}`);
  }

  return res.json() as Promise<ScanAgentListResponse>;
}
