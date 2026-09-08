import type { AgentSummary } from "./8004scan-client";
import { BSC_CHAIN_ID } from "./config";

/**
 * Heuristic filter to weed out empty, placeholder, and spam agents.
 * The 8004scan ecosystem has hundreds of 'Agent #123' or empty description testing agents.
 */
export function isInteresting(agent: AgentSummary): boolean {
  const name = (agent.name ?? "").trim();
  const desc = (agent.description ?? "").trim();
  const hasRealName =
    name.length > 0 && !/^Agent\s*#?\d+$/i.test(name) && !/^unnamed$/i.test(name);
  const hasDesc = desc.length > 10;
  return hasRealName && hasDesc;
}

/**
 * Filter for active BNB Smart Chain mainnet agents only (chain_id 56, non-testnet).
 */
export function filterBsc(agents: AgentSummary[]): AgentSummary[] {
  return agents.filter((a) => a.chain_id === BSC_CHAIN_ID && !a.is_testnet);
}
