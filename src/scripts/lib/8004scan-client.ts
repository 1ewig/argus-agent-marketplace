const BASE_URL = "https://api.8004scan.io/api/v1";

const RATE_LIMIT_MS = 150;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 300;

const API_KEY = process.env["8004SCAN_API_KEY"] ?? "";

let throttleQueue = Promise.resolve();

function throttle(): Promise<void> {
  const current = throttleQueue.then(async () => {
    await sleep(RATE_LIMIT_MS);
  });
  throttleQueue = current.catch(() => {});
  return current;
}


function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export class RequestFailureLog {
  readonly entries: string[] = [];
  private successes = 0;

  recordFailure(path: string, message: string): void {
    this.entries.push(`${path}: ${message}`);
  }

  recordSuccess(): void {
    this.successes++;
  }

  get total(): number {
    return this.entries.length + this.successes;
  }

  get failureRate(): number {
    return this.total === 0 ? 0 : this.entries.length / this.total;
  }
}

export const requestLog = new RequestFailureLog();

async function request<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    await throttle();
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        "User-Agent": "Argus-Marketplace/1.0",
      };
      if (API_KEY) headers["X-API-Key"] = API_KEY;

      const res = await fetch(url.toString(), {
        headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        // 4xx are permanent (except 429); 5xx are transient — retry those.
        if (res.status < 500 && res.status !== 429) {
          throw new Error(`8004scan API error ${res.status}: ${body.slice(0, 200)}`);
        }
        throw new TransientError(`HTTP ${res.status}: ${body.slice(0, 200)}`);
      }

      requestLog.recordSuccess();
      return (await res.json()) as T;
    } catch (e) {
      lastError = e as Error;
      const transient = e instanceof TransientError || (e as Error).name === "TimeoutError" ||
        /fetch|network/i.test((e as Error).message);
      if (!transient || attempt === MAX_ATTEMPTS) break;
      await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1) + Math.random() * 250);
    }
  }

  const message = `${lastError?.message ?? "unknown error"} (after ${MAX_ATTEMPTS} attempts)`;
  requestLog.recordFailure(path, message);
  throw new Error(message);
}

class TransientError extends Error {}

// --- Types ---

export interface AgentSummary {
  id: string;
  agent_id: string;
  token_id: string;
  chain_id: number;
  chain_type?: string;
  contract_address: string;
  is_testnet?: boolean;
  owner_id?: string | null;
  owner_address: string;
  owner_ens?: string | null;
  owner_username?: string | null;
  owner_avatar_url?: string | null;
  owner_publisher_tier?: string | null;
  owner_certified_name?: string | null;
  name?: string | null;
  description?: string | null;
  image_url?: string | null;
  is_verified?: boolean;
  star_count?: number;
  supported_protocols?: string[];
  x402_supported?: boolean;
  total_score?: number;
  rank?: number | null;
  network_rank?: number | null;
  health_score?: number | null;
  total_feedbacks?: number;
  average_score?: number;
  cross_chain_versions?: unknown;
  created_at: string;
  updated_at: string;
}

export interface AgentSummaryListResponse {
  items: AgentSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface GlobalStats {
  total_agents: number;
  total_users: number;
  daily_new_agents: number;
  daily_new_users: number;
  daily_feedbacks: number;
  average_feedback_score: number | null;
  chain_stats: ChainStats[];
}

export interface ChainStats {
  chain_id: number;
  name: string;
  is_testnet: boolean;
  total_agents: number;
  daily_new_agents: number;
  total_feedbacks: number;
  average_feedback_score: number | null;
  mcp_agents: number;
  a2a_agents: number;
  oasf_agents: number;
}

// --- API Methods ---

export async function listAgents(
  limit = 100,
  offset = 0,
  chainId?: number,
): Promise<AgentSummaryListResponse> {
  return request<AgentSummaryListResponse>("/agents", { limit, offset, chain_id: chainId });
}

export async function searchAgents(
  search: string,
  limit = 50,
  offset = 0,
  chainId?: number,
): Promise<AgentSummaryListResponse> {
  return request<AgentSummaryListResponse>("/agents", { search, limit, offset, chain_id: chainId });
}

export async function getLatestAgents(
  limit = 100,
  offset = 0,
  chainId?: number,
): Promise<AgentSummaryListResponse> {
  return request<AgentSummaryListResponse>("/agents/latest", { limit, offset, chain_id: chainId });
}

export async function getLeaderboard(): Promise<AgentSummaryListResponse> {
  return request<AgentSummaryListResponse>("/agents/leaderboard");
}

export async function getFeaturedAgents(): Promise<AgentSummaryListResponse> {
  return request<AgentSummaryListResponse>("/agents/featured");
}

export async function getTrendingAgents(): Promise<AgentSummaryListResponse> {
  return request<AgentSummaryListResponse>("/agents/trending");
}

export async function getAgent(chainId: number, tokenId: string): Promise<AgentSummary> {
  return request<AgentSummary>(`/agents/${chainId}/${tokenId}`);
}

export async function getGlobalStats(): Promise<GlobalStats> {
  return request<GlobalStats>("/stats/global");
}

export async function getAgentStats(chainId: number, tokenId: string): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>(`/stats/agents/${chainId}/${tokenId}`);
}
