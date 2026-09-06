/**
 * Market Intelligence Agent copy and structured schema constants.
 * Single Agent -> Single Structured JSON -> 4 Executive Cards.
 */

export const intelligenceContent = {
  marketIntelligence: {
    headerButtonLabel: 'Intelligence',
    headerButtonTooltip: 'Market Intelligence Overview',
    agentActiveBadge: 'ACTIVE',
    name: 'Market Intelligence',
    role: 'Live Market Sentinel',
    statusReady: 'LIVE',
    statusRunning: 'ANALYZING...',
    statusLive: 'LIVE SNAPSHOT',
    refreshButton: 'Scan Market',
    refreshing: 'Analyzing...',
    lastUpdated: (time: string) => `Updated ${time}`,
    subtitle: 'Order flow, key levels, and tactical playbook',
    controlCard: {
      title: 'CONTROL',
      buyersLabel: 'Buyers in control',
      sellersLabel: 'Sellers in control',
      neutralLabel: 'Balanced flow',
      imbalanceLabel: 'Imbalance',
      bidsSupport: 'Strong bid support',
      asksResistance: 'Heavy ask resistance',
      balancedFlow: 'Balanced liquidity',
    },
    levelsCard: {
      title: 'KEY LEVELS',
      supportLabel: 'Support',
      resistanceLabel: 'Resistance',
      biasPrefix: 'Bias:',
      biasBullish: 'Bullish',
      biasBearish: 'Bearish',
      biasNeutral: 'Neutral',
    },
    positioningCard: {
      title: 'POSITIONING',
      fundingLongs: 'Longs paying funding',
      fundingShorts: 'Shorts paying funding',
      fundingNeutral: 'Neutral funding',
      sentimentBullish: 'Bullish',
      sentimentMildlyBullish: 'Mildly bullish',
      sentimentNeutral: 'Neutral',
      sentimentMildlyBearish: 'Mildly bearish',
      sentimentBearish: 'Bearish',
    },
    playbookCard: {
      title: 'TACTICAL PLAYBOOK',
      targetLabel: 'Target',
      invalidationLabel: 'Invalidation',
      biases: {
        dip_buyer: 'Buy Dips',
        breakout: 'Breakout',
        range_scalp: 'Range Scalp',
        risk_off: 'Risk Off',
      },
    },
  },
} as const;
