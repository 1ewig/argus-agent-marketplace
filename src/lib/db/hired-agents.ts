import { db } from './schema';
import type {
  HiredAgentRecord,
  CreateHiredAgentInput,
  HiringStatus,
  ExecutionLogEntry,
} from '@/lib/types/hired-agent';

/**
 * Creates and registers a new Hired Agent in Dexie IndexedDB.
 */
export async function hireAgent(
  input: CreateHiredAgentInput,
): Promise<HiredAgentRecord> {
  const now = Date.now();
  const id = `hired-${now}-${Math.random().toString(36).substring(2, 7)}`;

  const initialLog: ExecutionLogEntry = {
    id: `log-${now}-init`,
    timestamp: now,
    type: 'action',
    title: 'Mission Initialized & Escrow Locked',
    detail: `Allocated ${input.allocatedBudget} ${input.budgetAsset || 'simBNB'} for ${input.mission.missionTitle}. Strategy deployed to simulation sandbox.`,
    status: 'success',
  };

  const record: HiredAgentRecord = {
    id,
    agentTokenId: input.agentTokenId,
    name: input.name,
    imageUrl: input.imageUrl,
    categoryKey: input.categoryKey,
    contractAddress: input.contractAddress,
    ownerAddress: input.ownerAddress,
    status: 'active',
    executionMode: 'simulation',
    mission: input.mission,
    allocatedBudget: input.allocatedBudget,
    spentBudget: 0.002, // Initial provisioning gas
    budgetAsset: input.budgetAsset || 'simBNB',
    simulatedPnlUsd: 0,
    healthScore: 99,
    actionsCount: 1,
    hiredAt: now,
    lastActiveAt: now,
    executionLogs: [initialLog],
  };

  await db.hiredAgents.put(record);
  return record;
}

/**
 * Retrieves all hired agents sorted by recent activity.
 */
export async function getHiredAgents(): Promise<HiredAgentRecord[]> {
  return await db.hiredAgents.orderBy('lastActiveAt').reverse().toArray();
}

/**
 * Retrieves a single hired agent by record ID.
 */
export async function getHiredAgentById(
  id: string,
): Promise<HiredAgentRecord | undefined> {
  return await db.hiredAgents.get(id);
}

/**
 * Updates the operational status of a hired agent.
 */
export async function updateHiredAgentStatus(
  id: string,
  status: HiringStatus,
): Promise<void> {
  const agent = await db.hiredAgents.get(id);
  if (!agent) return;

  const now = Date.now();
  const statusLog: ExecutionLogEntry = {
    id: `log-${now}-status`,
    timestamp: now,
    type: 'thought',
    title: `Agent Status Transition: ${status.toUpperCase()}`,
    detail:
      status === 'paused'
        ? 'Autonomous execution loop paused by user. Escrow funds safely held.'
        : status === 'active'
          ? 'Autonomous loop resumed. Re-verifying feed connectivity.'
          : status === 'terminated'
            ? 'Mission concluded. Unspent escrow balance returned to simulation wallet.'
            : 'Mission completed successfully.',
    status: 'success',
  };

  await db.hiredAgents.update(id, {
    status,
    lastActiveAt: now,
    executionLogs: [statusLog, ...agent.executionLogs],
  });
}

/**
 * Appends an execution log entry and increments action count.
 */
export async function appendExecutionLog(
  id: string,
  entry: Omit<ExecutionLogEntry, 'id' | 'timestamp'>,
): Promise<void> {
  const agent = await db.hiredAgents.get(id);
  if (!agent) return;

  const now = Date.now();
  const newLog: ExecutionLogEntry = {
    ...entry,
    id: `log-${now}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
  };

  const spentDelta = entry.costSimBnb ?? 0.0008;

  await db.hiredAgents.update(id, {
    lastActiveAt: now,
    actionsCount: agent.actionsCount + 1,
    spentBudget: Number((agent.spentBudget + spentDelta).toFixed(4)),
    executionLogs: [newLog, ...agent.executionLogs.slice(0, 99)], // keep last 100
  });
}

/**
 * Terminates a hired agent and reclaims escrow.
 */
export async function terminateHiredAgent(id: string): Promise<void> {
  await updateHiredAgentStatus(id, 'terminated');
}

/**
 * Deletes a hired agent record permanently from Dexie IndexedDB.
 */
export async function deleteHiredAgent(id: string): Promise<void> {
  await db.hiredAgents.delete(id);
}

/**
 * Simulates an authentic execution cycle for a hired agent.
 */
export async function triggerAgentExecutionCycle(id: string): Promise<void> {
  const agent = await db.hiredAgents.get(id);
  if (!agent || agent.status !== 'active') return;

  const now = Date.now();
  const randomTx = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  let log: ExecutionLogEntry;
  let pnlDelta = 0;

  switch (agent.mission.strategyType) {
    case 'health_factor': {
      const healthPct = 96 + Math.floor(Math.random() * 4);
      log = {
        id: `log-${now}-hf`,
        timestamp: now,
        type: 'alert',
        title: 'Venus Protocol Health Check Passed',
        detail: `Inspected collateral ratio: Current Health Factor ${healthPct}%. Liquidation risk negligible (threshold: ${agent.mission.healthFactorThreshold ?? 80}%).`,
        status: 'success',
        costSimBnb: 0.0003,
      };
      break;
    }
    case 'grid_trading': {
      const price = (610 + (Math.random() * 8 - 4)).toFixed(2);
      const isBuy = Math.random() > 0.5;
      pnlDelta = isBuy ? 1.85 : 2.4;
      log = {
        id: `log-${now}-grid`,
        timestamp: now,
        type: 'action',
        title: `Grid Rebalance Order Filled: ${isBuy ? 'BUY' : 'SELL'} BNB`,
        detail: `Executed at $${price} on PancakeSwap v3 pool. Basis spread 0.014%. Grid bounds: $${agent.mission.gridLowerPrice ?? 580}-$${agent.mission.gridUpperPrice ?? 640}.`,
        txHash: randomTx,
        status: 'success',
        gasUsedEth: '0.00041 BNB',
        costSimBnb: 0.0005,
      };
      break;
    }
    case 'yield_staking': {
      pnlDelta = 3.25;
      log = {
        id: `log-${now}-yield`,
        timestamp: now,
        type: 'action',
        title: 'Lista DAO slisBNB Yield Compounded',
        detail: 'Harvested accrued rewards and restaked into optimal BNB liquid staking pool. Estimated annualized APR: 7.42%.',
        txHash: randomTx,
        status: 'success',
        gasUsedEth: '0.00052 BNB',
        costSimBnb: 0.0007,
      };
      break;
    }
    case 'rebalancing': {
      pnlDelta = 2.85;
      log = {
        id: `log-${now}-rebal`,
        timestamp: now,
        type: 'action',
        title: 'PancakeSwap v3 LP Range Rebalanced',
        detail: `Adjusted concentrated liquidity tick range on ${agent.mission.targetPairOrProtocol}. Harvested trading fees and recentered active band within ±${agent.mission.rebalanceThresholdPct ?? 3}% tolerance.`,
        txHash: randomTx,
        status: 'success',
        gasUsedEth: '0.00062 BNB',
        costSimBnb: 0.0006,
      };
      break;
    }
    default: {
      log = {
        id: `log-${now}-mon`,
        timestamp: now,
        type: 'action',
        title: 'Telemetry Cycle Completed',
        detail: `Verified 20-level order book depth and whale movement alerts for ${agent.mission.targetPairOrProtocol}. No adverse volatility detected.`,
        status: 'success',
        costSimBnb: 0.0002,
      };
      break;
    }
  }

  await db.hiredAgents.update(id, {
    lastActiveAt: now,
    actionsCount: agent.actionsCount + 1,
    spentBudget: Number((agent.spentBudget + (log.costSimBnb ?? 0.0005)).toFixed(4)),
    simulatedPnlUsd: Number((agent.simulatedPnlUsd + pnlDelta).toFixed(2)),
    executionLogs: [log, ...agent.executionLogs.slice(0, 99)],
  });
}

const SEED_STORAGE_KEY = 'argus_has_seeded_hired_agents_v1';

/**
 * Seeds initial demo hired agents on first launch.
 */
export async function seedInitialHiredAgents(force = false): Promise<void> {
  if (typeof window !== 'undefined' && !force) {
    const hasSeeded = localStorage.getItem(SEED_STORAGE_KEY);
    if (hasSeeded) return;
  }

  const count = await db.hiredAgents.count();
  if (count > 0 && !force) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SEED_STORAGE_KEY, 'true');
    }
    return;
  }

  const now = Date.now();

  const demoAgents: HiredAgentRecord[] = [
    {
      id: 'demo-hired-hevo-sentinel',
      agentTokenId: '340533',
      name: 'Hevo Sentinel',
      imageUrl: null,
      categoryKey: 'risk',
      contractAddress: '0x8004A169FB45df524Ca5a6D0a501a3F4c1481b7a',
      ownerAddress: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
      status: 'active',
      executionMode: 'simulation',
      mission: {
        strategyType: 'health_factor',
        missionTitle: 'Venus Liquidation Sentinel',
        targetPairOrProtocol: 'Venus Protocol',
        executionIntervalMinutes: 5,
        healthFactorThreshold: 80,
      },
      allocatedBudget: 2.0,
      spentBudget: 0.0142,
      budgetAsset: 'simBNB',
      simulatedPnlUsd: 14.5,
      healthScore: 98,
      actionsCount: 24,
      hiredAt: now - 3600 * 1000 * 4,
      lastActiveAt: now - 60 * 1000 * 3,
      executionLogs: [
        {
          id: 'log-hevo-1',
          timestamp: now - 60 * 1000 * 3,
          type: 'alert',
          title: 'Venus Collateral Health Check',
          detail: 'Queried BNB/vBNB supply and borrow balance. Current collateral ratio 184% (Safe).',
          status: 'success',
          costSimBnb: 0.0003,
        },
        {
          id: 'log-hevo-2',
          timestamp: now - 60 * 1000 * 35,
          type: 'action',
          title: 'Whale Position Re-evaluation',
          detail: 'Detected 1,200 BNB repayment on Venus. Liquidation threshold buffer increased by +4.2%.',
          status: 'success',
          costSimBnb: 0.0004,
        },
        {
          id: 'log-hevo-3',
          timestamp: now - 3600 * 1000 * 4,
          type: 'action',
          title: 'Agent Hired & Escrow Initialized',
          detail: 'Locked 2.0 simBNB in simulated escrow. Monitoring cycle set to 5m interval.',
          status: 'success',
        },
      ],
    },
    {
      id: 'demo-hired-alpha-grid',
      agentTokenId: '341092',
      name: '4LPHA Yield Router',
      imageUrl: null,
      categoryKey: 'yield',
      contractAddress: '0x8004A169FB45df524Ca5a6D0a501a3F4c1481b7a',
      ownerAddress: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
      status: 'active',
      executionMode: 'simulation',
      mission: {
        strategyType: 'yield_staking',
        missionTitle: 'slisBNB Yield Maximizer',
        targetPairOrProtocol: 'Lista DAO',
        executionIntervalMinutes: 15,
      },
      allocatedBudget: 5.0,
      spentBudget: 0.0285,
      budgetAsset: 'simBNB',
      simulatedPnlUsd: 38.2,
      healthScore: 97,
      actionsCount: 42,
      hiredAt: now - 3600 * 1000 * 12,
      lastActiveAt: now - 60 * 1000 * 11,
      executionLogs: [
        {
          id: 'log-alpha-1',
          timestamp: now - 60 * 1000 * 11,
          type: 'action',
          title: 'Yield Harvest & Compound Cycle',
          detail: 'Harvested 0.018 slisBNB yield and restaked into Lista DAO pool. Net APR: 7.6%.',
          txHash: '0x4f8c9b2a7e1d5a3f9e0b8c7d6e5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a',
          status: 'success',
          gasUsedEth: '0.00048 BNB',
          costSimBnb: 0.0006,
        },
        {
          id: 'log-alpha-2',
          timestamp: now - 3600 * 1000 * 12,
          type: 'action',
          title: 'Mission Initialized',
          detail: 'Allocated 5.0 simBNB for auto-compounding liquid staking yield.',
          status: 'success',
        },
      ],
    },
    {
      id: 'demo-hired-lp-rebalancer',
      agentTokenId: '341400',
      name: 'PancakeSwap Liquidity Sentinel',
      imageUrl: null,
      categoryKey: 'rebalancing',
      contractAddress: '0x8004A169FB45df524Ca5a6D0a501a3F4c1481b7a',
      ownerAddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
      status: 'active',
      executionMode: 'simulation',
      mission: {
        strategyType: 'rebalancing',
        missionTitle: 'PancakeSwap v3 LP Rebalancer',
        targetPairOrProtocol: 'CAKE/BNB 0.25%',
        executionIntervalMinutes: 15,
        rebalanceThresholdPct: 3,
      },
      allocatedBudget: 3.0,
      spentBudget: 0.0195,
      budgetAsset: 'simBNB',
      simulatedPnlUsd: 22.8,
      healthScore: 99,
      actionsCount: 31,
      hiredAt: now - 3600 * 1000 * 8,
      lastActiveAt: now - 60 * 1000 * 5,
      executionLogs: [
        {
          id: 'log-rebal-1',
          timestamp: now - 60 * 1000 * 5,
          type: 'action',
          title: 'LP Concentrated Range Rebalanced',
          detail: 'Price drifted near boundary. Re-centered CAKE/BNB tick range and auto-compounded 0.042 CAKE fee rewards.',
          txHash: '0x3a9b1c7e5f2d4a6b8c0d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b',
          status: 'success',
          gasUsedEth: '0.00061 BNB',
          costSimBnb: 0.0006,
        },
      ],
    },
  ];

  await db.hiredAgents.bulkPut(demoAgents);

  if (typeof window !== 'undefined') {
    localStorage.setItem(SEED_STORAGE_KEY, 'true');
  }
}
