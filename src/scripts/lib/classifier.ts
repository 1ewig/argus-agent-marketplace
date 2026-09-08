import type { AgentSummary } from "./8004scan-client";
import type { AgentCompact, HackathonCategory } from "./types";

export const REGEX_RULES: Record<HackathonCategory, RegExp[]> = {
  rebalancing: [
    /\brebalanc/i,
    /\bliquidity\s*(range|position|manag|provider|pool|provision)/i,
    /\brange\s*(manag|reset|rebal|order)/i,
    /\bposition\s*manag/i,
    /\bconcentrated\s*liquidity\b/i,
    /\btick\s*(spacing|range)/i,
    /\bimpermanent\s*loss\b/i,
  ],
  grid_trading: [
    /\bgrid\s*(trad|order|strateg|bot)/i,
    /\bdca\b/i,
    /\btwapp?\b/i,
    /\barbitrage\b/i,
    /\bscalp(ing|er)?\b/i,
    /\balgo(rithmic)?\s*trad/i,
  ],
  yield: [
    /\byield\b/i,
    /\bapy\b/i,
    /\bapr\b/i,
    /\bfarm(ing)?\b/i,
    /\bauto\s*compound/i,
    /\bstak(e|ing)\b/i,
    /\bvault\b/i,
    /\b(yield|apy|apr|staking|vault|pool|portfolio|fee|return|strategy)\s*optimiz/i,
  ],
  health_factor: [
    /\bhealth\s*factor\b/i,
    /\bliquidation\b/i,
    /\bcollateral\b/i,
    /\blending\b/i,
    /\bborrow(ing|er)?\b/i,
    /\bltv\b/i,
    /\brisk\s*(monitor|buffer|manag|guard|hedg)/i,
  ],
  security: [/\bsecurity\b/i, /\baudit/i, /\bvulnerabilit/i, /\bhoneypot\b/i],
  payments: [/\bx402\b/i, /\bb402\b/i, /\bpayment\b/i, /\bmicropayment\b/i, /\bgasless\b/i],
  cross_agent: [/\ba2a\b/i, /\bmcp\b/i, /\bagent-to-agent\b/i, /\borchestrat/i],
  research: [/\bresearch\b/i, /\banaly(sis|tics|zer|st)/i, /\bsentiment\b/i, /\bforecast/i, /\bpredict/i],
};

/** Provenance recorded while crawling: agent_id -> "category:keyword" hits. */
const provenance = new Map<string, Set<string>>();
const dataSourceByAgent = new Map<string, AgentCompact["data_source"]>();

export function recordSource(agentId: string, source: AgentCompact["data_source"]): void {
  const precedence: Record<AgentCompact["data_source"], number> = {
    curated: 0,
    search: 1,
    crawl: 2,
  };
  const existing = dataSourceByAgent.get(agentId);
  if (!existing || precedence[source] < precedence[existing]) {
    dataSourceByAgent.set(agentId, source);
  }
}

export function getDataSource(agentId: string): AgentCompact["data_source"] {
  return dataSourceByAgent.get(agentId) ?? "crawl";
}

export function recordProvenance(agentId: string, category: string, keyword: string): void {
  const set = provenance.get(agentId) ?? new Set<string>();
  set.add(`${category}:${keyword}`);
  provenance.set(agentId, set);
}

export function matchedKeywords(agentId: string): string[] {
  return Array.from(provenance.get(agentId) ?? []).map((e) => e.split(":").slice(1).join(":"));
}

/**
 * Multi-signal categorization:
 * 1. Protocol capability flags (x402 for micropayments, MCP/A2A for cross-agent orchestration)
 * 2. Search provenance (which query bucket first surfaced this agent)
 * 3. Targeted regex taxonomy across title and description
 */
export function categorize(agent: AgentSummary): HackathonCategory[] {
  const hits = new Set<HackathonCategory>();

  // 1. Protocol capability flags
  if (agent.x402_supported) {
    hits.add("payments");
  }
  if (agent.supported_protocols?.some((p) => /mcp|a2a/i.test(p))) {
    hits.add("cross_agent");
  }

  // 2. Provenance-first: which search bucket surfaced this agent.
  const prov = provenance.get(agent.agent_id);
  if (prov) {
    for (const entry of prov) {
      const [cat] = entry.split(":");
      hits.add(cat as HackathonCategory);
    }
  }

  // 3. Regex as secondary multi-tag refiner.
  const text = `${agent.name ?? ""} ${agent.description ?? ""}`;
  for (const [cat, patterns] of Object.entries(REGEX_RULES) as [HackathonCategory, RegExp[]][]) {
    if (patterns.some((re) => re.test(text))) {
      hits.add(cat);
    }
  }

  return Array.from(hits);
}
