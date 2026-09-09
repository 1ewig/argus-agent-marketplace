/**
 * 8004scan API Types & Data Contracts
 */

export interface ScanAgentItem {
  id: string;
  agent_id: string;
  token_id: string;
  chain_id: number;
  chain_type?: string;
  contract_address: string;
  is_testnet?: boolean;
  name?: string | null;
  description?: string | null;
  image_url?: string | null;
  owner_address: string;
  owner_ens?: string | null;
  owner_username?: string | null;
  owner_avatar_url?: string | null;
  is_verified?: boolean;
  star_count?: number;
  total_score?: number;
  rank?: number | null;
  network_rank?: number | null;
  health_score?: number | null;
  total_feedbacks?: number;
  average_score?: number;
  supported_protocols?: string[];
  x402_supported?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScanAgentListResponse {
  items: ScanAgentItem[];
  total: number;
  limit: number;
  offset: number;
}

export type PrimaryPillarKey =
  | 'yield'
  | 'grid'
  | 'health'
  | 'rebalancing'
  | 'trading'
  | 'risk'
  | 'monitoring'
  | 'research'
  | 'infrastructure';

export type DiscoveryCategory =
  | PrimaryPillarKey
  | 'derivatives'
  | 'liquid_staking'
  | 'analytics'
  | 'payments'
  | 'cross_agent'
  | 'cross_chain'
  | 'depin_storage'
  | 'meme_social'
  | 'governance';

export type CategoryKey = DiscoveryCategory | 'all';

export type SemanticThemeVariant =
  | 'brand'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'neutral';

export interface CategoryConfig {
  key: CategoryKey;
  label: string;
  shortLabel: string;
  description: string;
  searchTerms: string[];
  icon: string;
  variant: SemanticThemeVariant;
  priority: number;
  isMandatory: boolean;
  defaultSort: 'score' | 'newest' | 'trending';
  featured?: boolean;
}

export interface CategoryQueryResult {
  key: DiscoveryCategory;
  label: string;
  total: number;
  agents: ScanAgentItem[];
  error?: boolean;
}

export type MarketplaceSortKey =
  | 'leaderboard'
  | 'trending'
  | 'featured'
  | 'latest'
  | 'newest';

export type MarketplaceTab =
  | 'all'
  | DiscoveryCategory
  | MarketplaceSortKey;

export interface FetchAgentsParams {
  feed?: string;
  category?: DiscoveryCategory | null;
  sort?: MarketplaceSortKey;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AgentsApiResponse {
  success: boolean;
  feed: string;
  category?: string;
  sort?: MarketplaceSortKey;
  query?: string;
  items: ScanAgentItem[];
  total: number;
  fallback?: boolean;
  spotlight?: {
    hevo: ScanAgentItem[];
    alpha: ScanAgentItem[];
  };
}
