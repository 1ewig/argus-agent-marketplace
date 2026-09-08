import { queryOptions } from '@tanstack/react-query';
import type { DiscoveryCategory, ScanAgentItem } from '@/lib/8004scan/types';

export interface AgentsApiResponse {
  success: boolean;
  feed: string;
  items: ScanAgentItem[];
  total: number;
  fallback?: boolean;
  spotlight?: {
    hevo: ScanAgentItem[];
    alpha: ScanAgentItem[];
  };
}

export interface FetchAgentsParams {
  feed?: string;
  category?: DiscoveryCategory | null;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function fetchAgents(params: FetchAgentsParams = {}): Promise<AgentsApiResponse> {
  const query = new URLSearchParams();
  if (params.feed) query.set('feed', params.feed);
  if (params.category) query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.offset) query.set('offset', String(params.offset));

  const res = await fetch(`/api/agents?${query.toString()}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch agents (${res.status})`);
  }

  return res.json() as Promise<AgentsApiResponse>;
}

export const agentsQuery = {
  all: ['agents'] as const,
  list: (params: FetchAgentsParams) =>
    queryOptions({
      queryKey: ['agents', 'list', params] as const,
      queryFn: () => fetchAgents(params),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }),
  spotlight: () =>
    queryOptions({
      queryKey: ['agents', 'spotlight'] as const,
      queryFn: () => fetchAgents({ feed: 'spotlight', limit: 10 }),
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    }),
};
