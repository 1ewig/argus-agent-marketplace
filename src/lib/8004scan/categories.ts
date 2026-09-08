import type {
  CategoryConfig,
  CategoryKey,
  DiscoveryCategory,
} from './types';

export const CATEGORIES: CategoryConfig[] = [
  // ──────────────────────────────────────────────
  // 1. Mandatory Hackathon Tracks (BNB Agent OS)
  // ──────────────────────────────────────────────
  {
    key: 'yield',
    label: 'Yield Optimisation',
    shortLabel: 'Yield',
    description:
      'Autonomous vaults and agents finding and allocating capital to the best risk-adjusted yield opportunities on BNB Chain.',
    searchTerms: ['yield', 'apy', 'venus', 'lending', 'vault'],
    icon: 'TrendingUp',
    variant: 'brand',
    priority: 1,
    isMandatory: true,
    defaultSort: 'score',
    featured: true,
  },
  {
    key: 'grid',
    label: 'Grid Trading',
    shortLabel: 'Grid',
    description:
      'Automated grid strategies and algorithmic market-making bots executing within defined price bands.',
    searchTerms: ['grid', 'grid trading', 'market maker', 'orderbook'],
    icon: 'Grid3x3',
    variant: 'info',
    priority: 2,
    isMandatory: true,
    defaultSort: 'score',
    featured: true,
  },
  {
    key: 'health',
    label: 'Health Factor Monitoring',
    shortLabel: 'Health',
    description:
      'Protective agents tracking loan collateral health, liquidation buffers, and debt ratios across BNB Chain protocols.',
    searchTerms: ['health', 'health factor', 'liquidation', 'collateral', 'safety'],
    icon: 'HeartPulse',
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
      'Watchdog agents tracking whale movements, contract anomalies, TVL shifts, and protocol gas spikes.',
    searchTerms: ['monitoring', 'monitor', 'alert', 'tracker', 'watch'],
    icon: 'Eye',
    variant: 'info',
    priority: 4,
    isMandatory: true,
    defaultSort: 'score',
    featured: true,
  },

  // ──────────────────────────────────────────────
  // 2. Protocols & ERC-8004 Native Capabilities
  // ──────────────────────────────────────────────
  {
    key: 'payments',
    label: 'x402 Micropayments',
    shortLabel: 'x402',
    description:
      'Autonomous agents providing pay-per-inference or on-chain services settled over the HTTP 402 payment standard.',
    searchTerms: ['x402', 'payment', 'micropayment', 'service', 'pay'],
    icon: 'Zap',
    variant: 'brand',
    priority: 5,
    isMandatory: false,
    defaultSort: 'score',
    featured: true,
  },
  {
    key: 'cross_agent',
    label: 'Multi-Agent & MCP',
    shortLabel: 'MCP / A2A',
    description:
      'Agents implementing Model Context Protocol and Agent-to-Agent communication for collaborative multi-agent execution.',
    searchTerms: ['mcp', 'a2a', 'swarm', 'multi-agent', 'orchestrator'],
    icon: 'Bot',
    variant: 'success',
    priority: 6,
    isMandatory: false,
    defaultSort: 'score',
    featured: true,
  },

  // ──────────────────────────────────────────────
  // 3. BNB Chain DeFi & Strategy Agents
  // ──────────────────────────────────────────────
  {
    key: 'trading',
    label: 'DEX Trading & DCA',
    shortLabel: 'Trading',
    description:
      'Smart routing, limit orders, dollar-cost averaging (DCA), and MEV-protected swaps on PancakeSwap and Thena.',
    searchTerms: ['trading', 'trade', 'dca', 'swap', 'dex'],
    icon: 'CandlestickChart',
    variant: 'warning',
    priority: 7,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'derivatives',
    label: 'Perpetuals & Hedging',
    shortLabel: 'Perps',
    description:
      'Delta-neutral funding rate harvesting and automated risk hedging across KiloEx and APX.',
    searchTerms: ['perps', 'futures', 'derivatives', 'hedge', 'funding'],
    icon: 'Activity',
    variant: 'danger',
    priority: 8,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'rebalancing',
    label: 'Portfolio & LP Rebalancing',
    shortLabel: 'Rebalance',
    description:
      'Active liquidity managers maintaining optimal concentrated tick ranges and portfolio asset allocations.',
    searchTerms: ['rebalance', 'rebalancing', 'lp', 'range', 'liquidity'],
    icon: 'RefreshCcw',
    variant: 'info',
    priority: 9,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'liquid_staking',
    label: 'Liquid Staking & Restaking',
    shortLabel: 'LST/LRT',
    description:
      'Strategies optimizing yield on slisBNB, BNSol, and liquid staking positions on BNB Chain.',
    searchTerms: ['lista', 'slisbnb', 'staking', 'restaking', 'lst'],
    icon: 'Coins',
    variant: 'brand',
    priority: 10,
    isMandatory: false,
    defaultSort: 'score',
  },

  // ──────────────────────────────────────────────
  // 4. Intelligence, Security & Ecosystem
  // ──────────────────────────────────────────────
  {
    key: 'research',
    label: 'Market & Alpha Research',
    shortLabel: 'Research',
    description:
      'AI analysts summarizing on-chain news, narrative trends, tokenomics, and whitepapers.',
    searchTerms: ['research', 'analysis', 'alpha', 'fundamental', 'narrative'],
    icon: 'Search',
    variant: 'info',
    priority: 11,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'analytics',
    label: 'On-Chain Analytics',
    shortLabel: 'Analytics',
    description:
      'Smart money profiling, token distribution graphs, and wallet cohort transaction forensics.',
    searchTerms: ['analytics', 'wallet', 'smart money', 'flow', 'holders'],
    icon: 'BarChart3',
    variant: 'neutral',
    priority: 12,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'risk',
    label: 'Risk, Audit & Security',
    shortLabel: 'Security',
    description:
      'Honeypot detection, rug checks, bytecode inspection, and liquidity lock verifiers.',
    searchTerms: ['risk', 'security', 'audit', 'rug', 'honeypot'],
    icon: 'ShieldAlert',
    variant: 'danger',
    priority: 13,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'meme_social',
    label: 'Meme & Fair-Launch',
    shortLabel: 'Meme',
    description:
      'High-speed sentiment detection and bonding curve watchers for Four.meme and community tokens.',
    searchTerms: ['meme', 'four.meme', 'gra.fun', 'fairlaunch', 'viral'],
    icon: 'Flame',
    variant: 'warning',
    priority: 14,
    isMandatory: false,
    defaultSort: 'trending',
  },
  {
    key: 'cross_chain',
    label: 'Cross-Chain & Bridges',
    shortLabel: 'Bridges',
    description:
      'Interoperability agents executing cross-chain arbitrage and LayerZero/Stargate messaging.',
    searchTerms: ['bridge', 'cross-chain', 'layerzero', 'multichain'],
    icon: 'ArrowLeftRight',
    variant: 'info',
    priority: 15,
    isMandatory: false,
    defaultSort: 'score',
  },
  {
    key: 'depin_storage',
    label: 'DePIN & Greenfield AI',
    shortLabel: 'Greenfield',
    description:
      'Decentralized data persistence on BNB Greenfield and distributed compute resource brokers.',
    searchTerms: ['greenfield', 'storage', 'depin', 'compute'],
    icon: 'HardDrive',
    variant: 'neutral',
    priority: 16,
    isMandatory: false,
    defaultSort: 'newest',
  },
  {
    key: 'governance',
    label: 'DAO Governance',
    shortLabel: 'Governance',
    description:
      'Automated voting agents, quorum trackers, and proposal impact simulators for BNB DAOs.',
    searchTerms: ['governance', 'dao', 'proposal', 'voting'],
    icon: 'Landmark',
    variant: 'neutral',
    priority: 17,
    isMandatory: false,
    defaultSort: 'score',
  },

  // ──────────────────────────────────────────────
  // 5. Global Catch-all
  // ──────────────────────────────────────────────
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

export const MANDATORY_CATEGORIES = CATEGORIES.filter((c) => c.isMandatory);
export const FEATURED_CATEGORIES = CATEGORIES.filter((c) => c.featured);

const DISCOVERY_CATEGORY_KEYS = new Set<string>(
  CATEGORIES.filter((c) => c.key !== 'all').map((c) => c.key),
);

export function isDiscoveryCategory(key: string): key is DiscoveryCategory {
  return DISCOVERY_CATEGORY_KEYS.has(key);
}

export function getCategory(key: CategoryKey): CategoryConfig {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
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
