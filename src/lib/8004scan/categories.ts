import type { DiscoveryCategory } from './types';

export const CATEGORY_DISCOVERY_CONFIG: Record<
  DiscoveryCategory,
  { query: string; label: string }
> = {
  yield_optimisation: { query: 'yield', label: 'Yield Optimisation' },
  grid_trading: { query: 'grid', label: 'Grid Trading' },
  rebalancing: { query: 'rebalance', label: 'Rebalancing' },
  health_factor: { query: 'health', label: 'Health Factor' },
  monitoring: { query: 'monitoring', label: 'Monitoring' },
  security: { query: 'security', label: 'Security & Audit' },
  payments: { query: 'x402', label: 'x402 Micropayments' },
  cross_agent: { query: 'MCP', label: 'Multi-Agent & MCP' },
};
