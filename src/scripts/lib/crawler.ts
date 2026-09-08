import {
  getLatestAgents,
  getLeaderboard,
  getFeaturedAgents,
  getTrendingAgents,
  searchAgents,
  type AgentSummary,
} from "./8004scan-client";
import {
  BSC_CHAIN_ID,
  PAGE_SIZE,
  MAX_PAGES_PER_SEARCH,
  ENRICH_TOP_N,
  REQUIRED_CATEGORIES,
  CRAWL_OFFSETS,
} from "./config";
import { filterBsc, isInteresting } from "./filter";
import {
  categorize,
  matchedKeywords,
  recordProvenance,
  recordSource,
  getDataSource,
} from "./classifier";
import type { AgentCompact } from "./types";

export function toCompact(agent: AgentSummary, enriched = false): AgentCompact {
  return {
    id: agent.id,
    agent_id: agent.agent_id,
    token_id: agent.token_id,
    chain_id: agent.chain_id,
    contract_address: agent.contract_address,
    name: agent.name ?? null,
    description: agent.description ?? null,
    image_url: agent.image_url ?? null,
    owner_address: agent.owner_address,
    owner_ens: agent.owner_ens ?? null,
    owner_username: agent.owner_username ?? null,
    total_score: agent.total_score ?? 0,
    star_count: agent.star_count ?? 0,
    total_feedbacks: agent.total_feedbacks ?? 0,
    average_score: agent.average_score ?? 0,
    health_score: agent.health_score ?? null,
    rank: agent.rank ?? null,
    network_rank: agent.network_rank ?? null,
    supported_protocols: agent.supported_protocols ?? [],
    x402_supported: agent.x402_supported ?? false,
    is_verified: agent.is_verified ?? false,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
    categories: categorize(agent),
    matched_keywords: matchedKeywords(agent.agent_id),
    data_source: getDataSource(agent.agent_id),
    enriched,
  };
}

/**
 * Crawl one category via server-side search terms, paginating up to MAX_PAGES_PER_SEARCH.
 */
export async function crawlCategory(
  category: string,
  keywords: string[],
): Promise<AgentSummary[]> {
  console.log(`\nCrawling category "${category}" via server-side search...`);
  const collected: AgentSummary[] = [];
  const seen = new Set<string>();

  await Promise.all(
    keywords.map(async (keyword) => {
      let total = Infinity;
      let pagesFetched = 0;
      for (
        let page = 0;
        page < MAX_PAGES_PER_SEARCH && page * PAGE_SIZE < total;
        page++
      ) {
        pagesFetched = page + 1;
        const offset = page * PAGE_SIZE;
        let res;
        try {
          res = await searchAgents(keyword, PAGE_SIZE, offset, BSC_CHAIN_ID);
        } catch (e) {
          console.log(
            `  search "${keyword}" offset ${offset} failed: ${(e as Error).message}`,
          );
          break;
        }
        total = res.total ?? 0;

        for (const agent of filterBsc(res.items ?? [])) {
          if (isInteresting(agent)) {
            recordProvenance(agent.agent_id, category, keyword);
            recordSource(agent.agent_id, "search");
          }
          if (seen.has(agent.agent_id)) continue;
          seen.add(agent.agent_id);
          if (isInteresting(agent)) collected.push(agent);
        }
      }
      console.log(
        `  "${keyword}": ${total === Infinity ? 0 : total} matches (${pagesFetched} page(s) fetched)`,
      );
    }),
  );

  console.log(`  → ${collected.length} interesting agents in "${category}"`);
  return collected;
}

/**
 * Fetch top-tier curated feeds (leaderboard, featured, trending).
 */
export async function fetchCurated(): Promise<AgentSummary[]> {
  console.log("Fetching curated sources (leaderboard / featured / trending)...");
  const results = await Promise.allSettled([
    getLeaderboard(PAGE_SIZE, BSC_CHAIN_ID),
    getFeaturedAgents(PAGE_SIZE, BSC_CHAIN_ID),
    getTrendingAgents(PAGE_SIZE, BSC_CHAIN_ID),
  ]);
  const labels = ["Leaderboard", "Featured", "Trending"];
  const collected: AgentSummary[] = [];
  results.forEach((res, i) => {
    if (res.status === "fulfilled") {
      const bsc = filterBsc(res.value.items ?? []);
      console.log(
        `  ${labels[i]}: ${(res.value.items ?? []).length} total, ${bsc.length} BSC`,
      );
      for (const a of bsc) recordSource(a.agent_id, "curated");
      collected.push(...bsc);
    } else {
      console.log(`  ${labels[i]} failed: ${res.reason?.message ?? res.reason}`);
    }
  });
  return collected;
}

/**
 * Sample across the long-tail latest agent feed.
 */
export async function fetchLongTail(seen: Set<string>): Promise<AgentSummary[]> {
  console.log(
    `\nCrawling latest-agents long tail (${CRAWL_OFFSETS.length} pages in parallel)...`,
  );
  const collected: AgentSummary[] = [];

  const results = await Promise.allSettled(
    CRAWL_OFFSETS.map(async (offset, i) => {
      const items =
        (await getLatestAgents(PAGE_SIZE, offset, BSC_CHAIN_ID)).items ?? [];
      const bsc = filterBsc(items);
      return { offset, i, items, bsc };
    }),
  );

  for (const res of results) {
    if (res.status === "fulfilled") {
      const { offset, i, items, bsc } = res.value;
      let added = 0;
      for (const agent of bsc) {
        if (seen.has(agent.agent_id)) continue;
        seen.add(agent.agent_id);
        if (isInteresting(agent)) {
          recordSource(agent.agent_id, "crawl");
          collected.push(agent);
          added++;
        }
      }
      console.log(
        `  offset ${offset} (${i + 1}/${CRAWL_OFFSETS.length}): ${items.length} total, ${bsc.length} BSC, +${added} new interesting`,
      );
    } else {
      console.log(`  offset failed: ${res.reason?.message ?? res.reason}`);
    }
  }
  return collected;
}

/**
 * Fast detail enrichment for the top agents in each required Smart Money category.
 * List and search endpoints already provide all core on-chain telemetry.
 */
export function enrichTopAgents(compact: AgentCompact[]): void {
  const byId = new Map(compact.map((a) => [a.agent_id, a]));
  const targets = new Set<string>();
  for (const cat of REQUIRED_CATEGORIES) {
    const bucket = compact
      .filter((a) => a.categories.includes(cat))
      .sort(
        (a, b) =>
          b.total_score - a.total_score ||
          b.total_feedbacks - a.total_feedbacks ||
          b.star_count - a.star_count,
      )
      .slice(0, ENRICH_TOP_N);
    for (const a of bucket) targets.add(a.agent_id);
  }

  for (const agentId of targets) {
    const agent = byId.get(agentId);
    if (agent) {
      agent.enriched = true;
    }
  }
  console.log(`\nEnriched ${targets.size} top agents across required categories.`);
}

