import type {
  CategoryConfig,
  CategoryKey,
  DiscoveryCategory,
} from './types';

// ──────────────────────────────────────────────
// 1. Primary Pillars (Top-Level Marketplace Domains)
// ──────────────────────────────────────────────
export const PRIMARY_PILLARS: CategoryConfig[] = [
  {
    key: 'yield',
    label: 'Yield & Staking',
    shortLabel: 'Yield',
    description:
      'Autonomous yield routers, Venus lending optimizers, and Lista DAO liquid staking allocators.',
    searchTerms: ['yield', 'apy', 'venus', 'lending', 'vault', 'staking', 'slisbnb'],
    icon: 'TrendingUp',
    variant: 'brand',
    priority: 1,
    isMandatory: true,
    defaultSort: 'score',
    featured: true,
  },
  {
    key: 'trading',
    label: 'Trading & Market Making',
    shortLabel: 'Trading',
    description:
      'Grid trading strategies, automated DEX execution, DCA accumulators, and derivatives hedging.',
    searchTerms: ['trading', 'grid', 'dca', 'swap', 'dex', 'perps', 'arbitrage'],
    icon: 'CandlestickChart',
    variant: 'info',
    priority: 2,
    isMandatory: true,
    defaultSort: 'score',
    featured: true,
  },
  {
    key: 'risk',
    label: 'Risk & Health Factor',
    shortLabel: 'Risk & Health',
    description:
      'Lending position sentinels, liquidation protection, smart contract auditing, and rug detection.',
    searchTerms: ['health', 'liquidation', 'risk', 'security', 'audit', 'collateral'],
    icon: 'ShieldAlert',
    variant: 'danger',
    priority: 3,
    isMandatory: true,
    defaultSort: 'score',
    featured: true,
  },
  {
    key: 'monitoring',
    label: 'Monitoring & Alerts',
    shortLabel: 'Monitoring',
    description:
      'Real-time whale trackers, TVL shifts, contract anomaly detectors, and protocol telemetry.',
    searchTerms: ['monitoring', 'monitor', 'alert', 'tracker', 'analytics', 'whale'],
    icon: 'Eye',
    variant: 'info',
    priority: 4,
    isMandatory: true,
    defaultSort: 'score',
    featured: true,
  },
  {
    key: 'research',
    label: 'Research & Intelligence',
    shortLabel: 'Research',
    description:
      'On-chain analytics, tokenomics research, narrative tracking, and community sentiment.',
    searchTerms: ['research', 'analysis', 'alpha', 'fundamental', 'sentiment', 'news'],
    icon: 'Search',
    variant: 'info',
    priority: 5,
    isMandatory: false,
    defaultSort: 'score',
    featured: true,
  },
  {
    key: 'infrastructure',
    label: 'Infrastructure & Tools',
    shortLabel: 'Infra',
    description:
      'Multi-agent orchestrators, MCP providers, x402 payment rails, and Greenfield storage.',
    searchTerms: ['infrastructure', 'mcp', 'x402', 'tool', 'discovery', 'greenfield', 'oracle'],
    icon: 'Wrench',
    variant: 'neutral',
    priority: 6,
    isMandatory: false,
    defaultSort: 'score',
    featured: true,
  },
  {
    key: 'all',
    label: 'All Agents',
    shortLabel: 'All',
    description: 'Browse every agent registered on BNB Smart Chain under ERC-8004 specification.',
    searchTerms: [],
    icon: 'Layers',
    variant: 'neutral',
    priority: 99,
    isMandatory: false,
    defaultSort: 'score',
  },
];

// Full categories list for comprehensive lookups
export const CATEGORIES: CategoryConfig[] = [
  ...PRIMARY_PILLARS,
  // Sub-categories preserved for backward compatibility
  {
    key: 'grid',
    label: 'Grid Trading',
    shortLabel: 'Grid',
    description: 'Automated grid trading and market making.',
    searchTerms: ['grid', 'grid trading', 'market maker'],
    icon: 'Grid3x3',
    variant: 'info',
    priority: 10,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'health',
    label: 'Health Factor Monitoring',
    shortLabel: 'Health',
    description: 'Lending liquidation and health factor monitors.',
    searchTerms: ['health', 'health factor', 'liquidation'],
    icon: 'HeartPulse',
    variant: 'danger',
    priority: 11,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'rebalancing',
    label: 'Portfolio Rebalancing',
    shortLabel: 'Rebalance',
    description: 'Concentrated liquidity and portfolio rebalancers.',
    searchTerms: ['rebalance', 'rebalancing', 'lp'],
    icon: 'RefreshCcw',
    variant: 'info',
    priority: 12,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'derivatives',
    label: 'Perpetuals & Hedging',
    shortLabel: 'Perps',
    description: 'Funding rate arb and perpetuals execution.',
    searchTerms: ['perps', 'futures', 'derivatives'],
    icon: 'Activity',
    variant: 'danger',
    priority: 13,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'liquid_staking',
    label: 'Liquid Staking',
    shortLabel: 'LST/LRT',
    description: 'slisBNB and liquid staking yields.',
    searchTerms: ['lista', 'slisbnb', 'staking'],
    icon: 'Coins',
    variant: 'brand',
    priority: 14,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'analytics',
    label: 'On-Chain Analytics',
    shortLabel: 'Analytics',
    description: 'Whale tracking and smart money analytics.',
    searchTerms: ['analytics', 'wallet', 'smart money'],
    icon: 'BarChart3',
    variant: 'neutral',
    priority: 15,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'payments',
    label: 'x402 Micropayments',
    shortLabel: 'x402',
    description: 'HTTP 402 pay-per-request agents.',
    searchTerms: ['x402', 'payment'],
    icon: 'Zap',
    variant: 'brand',
    priority: 16,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'cross_agent',
    label: 'Multi-Agent & MCP',
    shortLabel: 'MCP / A2A',
    description: 'MCP & A2A collaborative agents.',
    searchTerms: ['mcp', 'a2a', 'swarm'],
    icon: 'Bot',
    variant: 'success',
    priority: 17,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'cross_chain',
    label: 'Cross-Chain & Bridges',
    shortLabel: 'Bridges',
    description: 'LayerZero and cross-chain execution.',
    searchTerms: ['bridge', 'cross-chain', 'layerzero'],
    icon: 'ArrowLeftRight',
    variant: 'info',
    priority: 18,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'depin_storage',
    label: 'DePIN & Greenfield',
    shortLabel: 'Greenfield',
    description: 'Greenfield data and compute brokers.',
    searchTerms: ['greenfield', 'storage', 'depin'],
    icon: 'HardDrive',
    variant: 'neutral',
    priority: 19,
    isMandatory: false,
    defaultSort: 'newest',
  },
  {
    key: 'meme_social',
    label: 'Meme & Fair-Launch',
    shortLabel: 'Meme',
    description: 'Four.meme and bonding curve bots.',
    searchTerms: ['meme', 'four.meme', 'gra.fun'],
    icon: 'Flame',
    variant: 'warning',
    priority: 20,
    isMandatory: false,
    defaultSort: 'trending',
  },
  {
    key: 'governance',
    label: 'DAO Governance',
    shortLabel: 'Governance',
    description: 'DAO proposal evaluation and voting.',
    searchTerms: ['governance', 'dao', 'proposal'],
    icon: 'Landmark',
    variant: 'neutral',
    priority: 21,
    isMandatory: false,
    defaultSort: 'score',
  },
];

// Map configuration for fast lookups in API and client
export const CATEGORY_DISCOVERY_CONFIG: Record<
  DiscoveryCategory,
  {
    query: string;
    label: string;
    searchTerms: string[];
    defaultSort: 'score' | 'newest' | 'trending';
  }
> = Object.fromEntries(
  CATEGORIES.filter((c): c is CategoryConfig & { key: DiscoveryCategory } => c.key !== 'all').map(
    (c) => [
      c.key,
      {
        query: c.searchTerms[0] || '',
        label: c.label,
        searchTerms: c.searchTerms,
        defaultSort: c.defaultSort,
      },
    ],
  ),
) as Record<
  DiscoveryCategory,
  {
    query: string;
    label: string;
    searchTerms: string[];
    defaultSort: 'score' | 'newest' | 'trending';
  }
>;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

export const MANDATORY_CATEGORIES = PRIMARY_PILLARS.filter((c) => c.isMandatory);
export const FEATURED_CATEGORIES = PRIMARY_PILLARS.filter((c) => c.featured);

const DISCOVERY_CATEGORY_KEYS = new Set<string>(
  CATEGORIES.filter((c) => c.key !== 'all').map((c) => c.key),
);

export function isDiscoveryCategory(key: string): key is DiscoveryCategory {
  return DISCOVERY_CATEGORY_KEYS.has(key);
}

export function getCategory(key: CategoryKey): CategoryConfig {
  return CATEGORIES.find((c) => c.key === key) ?? PRIMARY_PILLARS[PRIMARY_PILLARS.length - 1];
}

export function getSearchQuery(categoryKey: CategoryKey): string {
  const category = getCategory(categoryKey);
  return category.searchTerms[0] || '';
}


/**
 * Returns optimized search params + chain filter for 8004scan
 */
export function buildCategoryParams(
  categoryKey: CategoryKey,
  limit = 24,
): URLSearchParams {
  const category = getCategory(categoryKey);
  const params = new URLSearchParams({
    limit: String(limit),
    chain_id: '56',
  });

  if (categoryKey !== 'all' && category.searchTerms.length > 0) {
    params.set('search', category.searchTerms[0]);
  }

  if (category.defaultSort === 'score') {
    params.set('sort_by', 'total_score');
    params.set('sort_order', 'desc');
  }

  return params;
}

/**
 * Maps EVM Chain ID to 8004scan URL chain slug.
 * e.g. 56 -> 'bsc', 360 -> 'shape', 1 -> 'ethereum'
 */
export function get8004ScanChainSlug(chainId: number | string): string {
  const numericId = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
  switch (numericId) {
    case 56:
      return 'bsc';
    case 97:
      return 'bsc-testnet';
    case 1:
      return 'ethereum';
    case 8453:
      return 'base';
    case 42161:
      return 'arbitrum';
    case 10:
      return 'optimism';
    case 137:
      return 'polygon';
    case 360:
      return 'shape';
    default:
      return 'bsc';
  }
}

/**
 * Builds canonical 8004scan agent profile URL.
 * e.g. https://8004scan.io/agents/bsc/340533
 */
export function get8004ScanAgentUrl(chainId: number | string, tokenId: string): string {
  const chainSlug = get8004ScanChainSlug(chainId);
  return `https://8004scan.io/agents/${chainSlug}/${tokenId}`;
}
