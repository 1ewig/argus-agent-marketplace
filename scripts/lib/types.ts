export const HACKATHON_CATEGORIES = [
  "rebalancing",
  "grid_trading",
  "yield",
  "health_factor",
  "security",
  "payments",
  "cross_agent",
  "research",
] as const;

export type HackathonCategory = (typeof HACKATHON_CATEGORIES)[number];

export interface AgentCompact {
  id: string;
  agent_id: string;
  token_id: string;
  chain_id: number;
  contract_address: string;
  name: string | null;
  description: string | null;
  image_url: string | null;
  owner_address: string;
  owner_ens: string | null;
  owner_username: string | null;
  total_score: number;
  star_count: number;
  total_feedbacks: number;
  average_score: number;
  health_score: number | null;
  rank: number | null;
  network_rank: number | null;
  supported_protocols: string[];
  x402_supported: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  categories: HackathonCategory[];
  matched_keywords: string[];
  data_source: "search" | "curated" | "crawl";
  enriched: boolean;
}

export type CategoryBuckets = Record<HackathonCategory | "uncategorized", AgentCompact[]>;
export type CategoryCounts = Record<HackathonCategory | "uncategorized", number>;

export interface QualityGateReport {
  generated_at: string;
  total_agents: number;
  duplicates: number;
  request_stats: {
    total: number;
    failures: number;
    failure_rate: number;
    failures_detail: string[];
  };
  category_counts: Record<string, number>;
  quality_gates: {
    all_required_categories_min_15: boolean;
    no_duplicate_agent_ids: boolean;
    failure_rate_under_30pct: boolean;
  };
}

export interface CategorizedAgentsPayload {
  generated_at: string;
  counts: Record<string, number>;
  agents: Record<string, AgentCompact[]>;
}
