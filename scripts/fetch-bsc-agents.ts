import {
  getGlobalStats,
  requestLog,
  type AgentSummary,
} from "./lib/8004scan-client";
import { BSC_CHAIN_ID, CATEGORY_SEARCHES } from "./lib/config";
import {
  crawlCategory,
  fetchCurated,
  fetchLongTail,
  enrichTopAgents,
  toCompact,
} from "./lib/crawler";
import { isInteresting } from "./lib/filter";
import {
  evaluateQualityGates,
  saveArtifacts,
  printExecutionSummary,
} from "./lib/report";
import type { AgentCompact, CategoryBuckets } from "./lib/types";

async function logGlobalStats(): Promise<void> {
  try {
    const stats = await getGlobalStats();
    const bscChain = stats.chain_stats?.find((c) => c.chain_id === BSC_CHAIN_ID);
    if (bscChain) {
      console.log(
        `BSC: ${(bscChain.total_agents ?? 0).toLocaleString()} agents | ${bscChain.daily_new_agents ?? "?"}/day | MCP: ${bscChain.mcp_agents ?? "?"} | A2A: ${bscChain.a2a_agents ?? "?"}`,
      );
    }
  } catch (e) {
    console.log("Stats unavailable:", (e as Error).message);
  }
}

function partitionCategories(compact: AgentCompact[]): CategoryBuckets {
  const byCategory: CategoryBuckets = {
    rebalancing: [],
    grid_trading: [],
    yield: [],
    health_factor: [],
    security: [],
    payments: [],
    cross_agent: [],
    research: [],
    uncategorized: [],
  };

  for (const agent of compact) {
    if (agent.categories.length === 0) {
      byCategory.uncategorized.push(agent);
    } else {
      for (const cat of agent.categories) {
        byCategory[cat]?.push(agent);
      }
    }
  }

  return byCategory;
}

async function main(): Promise<void> {
  console.log("=== 8004scan BSC Agent Pipeline (Modular Orchestrator) ===\n");

  // 1. Concurrent global stats, category crawl, and curated feeds
  const crawled = new Map<string, AgentSummary>();
  const [, categoryBatches, curated] = await Promise.all([
    logGlobalStats(),
    Promise.all(
      Object.entries(CATEGORY_SEARCHES).map(([category, keywords]) =>
        crawlCategory(category, keywords),
      ),
    ),
    fetchCurated(),
  ]);

  for (const batch of categoryBatches) {
    for (const agent of batch) {
      if (!crawled.has(agent.agent_id)) crawled.set(agent.agent_id, agent);
    }
  }

  const seen = new Set<string>([
    ...crawled.keys(),
    ...curated.map((a) => a.agent_id),
  ]);
  for (const a of curated) if (isInteresting(a)) crawled.set(a.agent_id, a);

  // 2. Parallel long-tail crawl
  const longTail = await fetchLongTail(seen);
  for (const a of longTail) crawled.set(a.agent_id, a);

  // 4. Merge, transform, and sort by score
  const allBsc = Array.from(crawled.values()).sort(
    (a, b) => (b.total_score ?? 0) - (a.total_score ?? 0),
  );
  const compact = allBsc.map((a) => toCompact(a));
  console.log(`\nTotal interesting BSC agents: ${compact.length}`);

  // 5. Fast enrichment pass for top agents across required categories
  enrichTopAgents(compact);

  // 6. Partition into category buckets
  const byCategory = partitionCategories(compact);

  // 7. Quality gate evaluation and persistence
  const report = evaluateQualityGates(
    compact,
    byCategory,
    requestLog.failureRate,
  );
  await saveArtifacts(compact, byCategory, report);

  // 8. Terminal summary
  printExecutionSummary(compact, byCategory, report);
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
