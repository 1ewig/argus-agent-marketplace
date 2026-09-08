import {
  getLatestAgents,
  getLeaderboard,
  getFeaturedAgents,
  getTrendingAgents,
  getAgent,
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

  for (const keyword of keywords) {
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
        total = 0;
        pagesFetched = page;
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
      `  "${keyword}": ${total} matches (${pagesFetched} page(s) fetched)`,
    );
  }

  console.log(`  → ${collected.length} interesting agents in "${category}"`);
  return collected;
}

/**
 * Fetch top-tier curated feeds (leaderboard, featured, trending).
 */
export async function fetchCurated(): Promise<AgentSummary[]> {
  console.log("Fetching curated sources (leaderboard / featured / trending)...");
  const results = await Promise.allSettled([
    getLeaderboard(),
    getFeaturedAgents(),
    getTrendingAgents(),
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
    `\nCrawling latest-agents long tail (${CRAWL_OFFSETS.length} pages)...`,
  );
  const collected: AgentSummary[] = [];

  for (const [i, offset] of CRAWL_OFFSETS.entries()) {
    process.stdout.write(
      `  offset ${offset} (${i + 1}/${CRAWL_OFFSETS.length})... `,
    );
    let items: AgentSummary[];
    try {
      items =
        (await getLatestAgents(PAGE_SIZE, offset, BSC_CHAIN_ID)).items ?? [];
    } catch (e) {
      console.log(`failed: ${(e as Error).message}`);
      continue;
    }

    const bsc = filterBsc(items);
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
      `${items.length} total, ${bsc.length} BSC, +${added} new interesting (running: ${collected.length})`,
    );
  }
  return collected;
}

/**
 * Best-effort detail enrichment for the top agents in each required Smart Money category.
 */
export async function enrichTopAgents(compact: AgentCompact[]): Promise<void> {
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

  console.log(
    `\nEnriching ${targets.size} top agents across required categories...`,
  );
  let done = 0;
  for (const agentId of targets) {
    const agent = byId.get(agentId);
    if (!agent) continue;
    try {
      const detail = await getAgent(BSC_CHAIN_ID, agent.token_id);
      agent.health_score = detail.health_score ?? agent.health_score;
      agent.rank = detail.rank ?? agent.rank;
      agent.network_rank = detail.network_rank ?? agent.network_rank;
      agent.total_feedbacks = detail.total_feedbacks ?? agent.total_feedbacks;
      agent.average_score = detail.average_score ?? agent.average_score;
      agent.is_verified = detail.is_verified ?? agent.is_verified;
      agent.updated_at = detail.updated_at ?? agent.updated_at;
      agent.enriched = true;
    } catch {
      // Detail endpoint is occasionally flaky (upstream 500s) — list data remains authoritative.
    }
    done++;
    if (done % 10 === 0) console.log(`  ${done}/${targets.size} processed...`);
  }
  console.log(`  Enrichment pass done (${targets.size} targeted).`);
}
