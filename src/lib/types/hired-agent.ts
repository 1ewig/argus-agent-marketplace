/**
 * Types & Data Contracts for Hired Autonomous AI Agents (ERC-8004 / ERC-8183 / x402)
 */

export type StrategyType =
  | 'health_factor'
  | 'grid_trading'
  | 'yield_staking'
  | 'rebalancing'
  | 'monitoring'
  | 'custom';

export type HiringStatus = 'active' | 'paused' | 'completed' | 'terminated';

export type ExecutionLogType = 'action' | 'thought' | 'alert' | 'payment';

export interface ExecutionLogEntry {
  id: string;
  timestamp: number;
  type: ExecutionLogType;
  title: string;
  detail: string;
  txHash?: string;
  gasUsedEth?: string;
  costSimBnb?: number;
  status: 'success' | 'pending' | 'failed';
}

export interface AgentMissionConfig {
  strategyType: StrategyType;
  missionTitle: string;
  targetPairOrProtocol: string;
  executionIntervalMinutes: number;
  healthFactorThreshold?: number;
  gridUpperPrice?: number;
  gridLowerPrice?: number;
  rebalanceThresholdPct?: number;
  customPrompt?: string;
}

export interface HiredAgentRecord {
  id: string;
  agentTokenId: string;
  name: string;
  imageUrl?: string | null;
  categoryKey: string;
  contractAddress: string;
  ownerAddress: string;
  status: HiringStatus;
  executionMode: 'simulation' | 'live';
  mission: AgentMissionConfig;
  allocatedBudget: number;
  spentBudget: number;
  budgetAsset: 'simBNB' | 'simUSDT' | 'tBNB';
  simulatedPnlUsd: number;
  healthScore: number;
  actionsCount: number;
  hiredAt: number;
  lastActiveAt: number;
  executionLogs: ExecutionLogEntry[];
}

export interface CreateHiredAgentInput {
  agentTokenId: string;
  name: string;
  imageUrl?: string | null;
  categoryKey: string;
  contractAddress: string;
  ownerAddress: string;
  mission: AgentMissionConfig;
  allocatedBudget: number;
  budgetAsset?: 'simBNB' | 'simUSDT' | 'tBNB';
}
