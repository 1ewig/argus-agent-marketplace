export interface MarketPulseAsset {
  symbol: string;
  baseAsset: string;
  price: number;
  changePercent: number;
}

export interface MarketPulse {
  btcChange: number;
  ethChange: number;
  solChange: number;
  bnbChange: number;
  assets: MarketPulseAsset[];
  bias: 'Risk-On' | 'Mildly Risk-On' | 'Neutral' | 'Mildly Risk-Off' | 'Risk-Off';
  averageChange: number;
}

export interface MoverItem {
  symbol: string;
  baseAsset: string;
  price: number;
  changePercent: number;
}

export interface TopMovers {
  gainers: MoverItem[];
  losers: MoverItem[];
}

export interface FundingHeatmapItem {
  symbol: string;
  baseAsset: string;
  markPrice: number;
  rate: number;
  ratePercent: number;
  apr: number;
  bias: 'longs_paying' | 'shorts_paying' | 'neutral';
}

export interface GlobalPositioning {
  retailRatio: number;
  whaleRatio: number;
  retailBias: 'Long-biased' | 'Short-biased' | 'Neutral';
  whaleBias: 'Long-biased' | 'Short-biased' | 'Neutral';
  summary: string;
}

export interface GlobalMarketOverviewData {
  timestamp: number;
  marketPulse: MarketPulse;
  topMovers: TopMovers;
  funding: FundingHeatmapItem[];
  positioning: GlobalPositioning;
}

export interface GlobalMarketOverviewResponse {
  success: boolean;
  timestamp: number;
  data: GlobalMarketOverviewData;
}
