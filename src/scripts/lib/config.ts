import { join } from "node:path";
import type { HackathonCategory } from "./types";

export const BSC_CHAIN_ID = 56;
export const PAGE_SIZE = 50;
export const MAX_PAGES_PER_SEARCH = 2;
export const DATA_DIR = join(
  import.meta.dirname ?? join(process.cwd(), "src", "scripts", "lib"),
  "..",
  "data",
);
export const ENRICH_TOP_N = 15;
export const MIN_AGENTS_PER_REQUIRED_CATEGORY = 15;
export const MAX_FAILURE_RATE = 0.3;

export const REQUIRED_CATEGORIES = [
  "rebalancing",
  "grid_trading",
  "yield",
  "health_factor",
] as const satisfies readonly HackathonCategory[];

export type RequiredCategory = (typeof REQUIRED_CATEGORIES)[number];

export const CATEGORY_SEARCHES: Record<HackathonCategory, string[]> = {
  rebalancing: [
    "rebalance",
    "liquidity position",
    "range order",
    "LP manager",
    "concentrated liquidity",
  ],
  grid_trading: ["grid trading", "grid bot", "TWAP", "DCA bot"],
  yield: ["yield", "APY", "staking", "auto compound"],
  health_factor: ["health factor", "liquidation", "lending", "borrow"],
  security: ["security audit", "honeypot", "vulnerability"],
  payments: ["x402", "payment", "micropayment"],
  cross_agent: ["agent-to-agent", "orchestrator", "MCP"],
  research: ["research", "market analysis"],
};

export const CRAWL_OFFSETS = [0, 50, 150, 200];

