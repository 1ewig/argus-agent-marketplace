export const hiredAgentsContent = {
  hiredAgents: {
    badge: 'Autonomous Workforce',
    panel: {
      title: 'Hired Agents',
      subtitle: (activeCount: number, totalCount: number) =>
        `${activeCount} active of ${totalCount} deployed`,
      collapseTooltip: 'Collapse Hired Agents Panel',
      expandTooltip: 'Open Hired Agents Panel',
      emptyTitle: 'No Active Agents Hired',
      emptySubtitle:
        'Hire autonomous agents from the marketplace to run monitoring, grid trading, or yield compounding in simulation mode.',
      hireFirstAction: 'Explore Marketplace',
      viewAllAction: 'Inspect Workspace',
      pauseTooltip: 'Pause autonomous loop',
      resumeTooltip: 'Resume autonomous loop',
      deleteTooltip: 'Delete Agent Record',
      statusActive: 'Active',
      statusPaused: 'Paused',
      statusCompleted: 'Done',
      statusTerminated: 'Terminated',
      spentLabel: 'Spent',
      pnlLabel: 'PnL',
      actionsCount: (count: number) => `${count} cycles`,
      autoCycleLabel: 'Auto-Execution Heartbeat',
      autoCycleActive: 'Auto-Tick Active (15s)',
      autoCycleInactive: 'Auto-Tick Off',
      autoCycleTooltip: 'Automatically triggers simulated execution cycles for active agents periodically',
      deleteDialog: {
        title: 'Delete Agent Record',
        description: (name?: string) =>
          name
            ? `Are you sure you want to permanently delete "${name}" and all associated logs from your workspace?`
            : 'Are you sure you want to permanently delete this agent and all associated logs from your workspace?',
        confirm: 'Delete Record',
        cancel: 'Cancel',
      },
    },
    modal: {
      title: 'Hire Autonomous Agent',
      subtitle: (name: string, tokenId: string) =>
        `Provision task mandate and simulation escrow for ${name} (#${tokenId})`,
      step1Title: '1. Mission & Strategy',
      step2Title: '2. Risk & Budget',
      step3Title: '3. Escrow Authorization',
      closeModal: 'Close',
      nextStep: 'Continue',
      prevStep: 'Back',
      confirmHire: 'Authorize & Deploy Agent',
      deploying: 'Locking Escrow & Spawning Sandbox...',
      strategies: {
        healthFactor: {
          label: 'Venus Lending Sentinel',
          desc: 'Monitors collateral ratio and liquidations on Venus Protocol. Auto-alerts on risk spikes.',
        },
        gridTrading: {
          label: 'Grid Trading & Market Making',
          desc: 'Places automated grid limit orders within designated price bands on PancakeSwap.',
        },
        yieldStaking: {
          label: 'Lista DAO slisBNB Optimizer',
          desc: 'Auto-harvests rewards and rebalances capital into the highest yield staking pools.',
        },
        rebalancing: {
          label: 'PancakeSwap LP Rebalancer',
          desc: 'Dynamically rebalances concentrated liquidity ranges and auto-compounds trading fees on PancakeSwap v3.',
        },
        custom: {
          label: 'Custom Autonomous Mandate',
          desc: 'Provide custom natural language instructions and strategy constraints.',
        },
      },
      fields: {
        strategyLabel: 'Strategy Template',
        missionTitleLabel: 'Mission Name',
        missionTitlePlaceholder: 'e.g., Venus Collateral Sentinel',
        targetLabel: 'Target Protocol or Pair',
        targetPlaceholder: 'e.g., BNB/USDT or Venus Protocol',
        intervalLabel: 'Execution Loop Interval',
        interval5m: '5 minutes (High frequency)',
        interval15m: '15 minutes (Standard)',
        interval1h: '1 hour (Low frequency)',
        healthThresholdLabel: 'Health Factor Alert Floor (%)',
        gridUpperLabel: 'Grid Upper Band ($)',
        gridLowerLabel: 'Grid Lower Band ($)',
        rebalanceThresholdLabel: 'LP Drift Rebalance Floor (±%)',
        customPromptLabel: 'Custom Directive Prompt',
        customPromptPlaceholder:
          'Describe specific conditions, triggers, or portfolio boundaries for this agent...',
        budgetLabel: 'Simulation Budget Allocation',
        budgetHelp:
          'Virtual funds locked in local escrow. Used for simulated x402 micropayments and gas.',
        assetLabel: 'Asset',
        simulationNoticeTitle: 'Zero Real Capital Required (Simulation Mode)',
        simulationNoticeDesc:
          'You are hiring this agent in Argus Simulation Sandbox. Authentic live market feeds and order books will be used, but all transaction settlements and fees are 100% simulated.',
      },
      review: {
        summaryTitle: 'Task Agreement Summary',
        agentLabel: 'Agent',
        strategyLabel: 'Selected Strategy',
        intervalLabel: 'Cycle Interval',
        escrowLabel: 'Escrow Commitment',
        networkLabel: 'Execution Rail',
        networkValue: 'BNB Smart Chain (Simulated ID 56)',
        protocolStandard: 'ERC-8004 / ERC-8183 / x402',
      },
    },
    workspace: {
      breadcrumbMarketplace: 'Marketplace',
      breadcrumbHired: 'Hired Agents',
      statusActive: 'Executing Autonomous Loop',
      statusPaused: 'Execution Paused',
      statusTerminated: 'Contract Terminated',
      metrics: {
        allocated: 'Escrow Allocated',
        spent: 'Micro-Fees & Gas Spent',
        pnl: 'Simulated PnL / Yield',
        health: 'Health Score',
        actions: 'Cycles Completed',
        hiredDate: 'Deployment Date',
      },
      tabs: {
        overview: 'Mission Mandate',
        timeline: 'Execution Activity Stream',
        terminal: 'Raw Telemetry & Receipts',
      },
      mandate: {
        title: 'Operational Strategy & Risk Ceilings',
        strategyType: 'Strategy Mode',
        targetProtocol: 'Target Rail',
        interval: 'Loop Cadence',
        thresholds: 'Trigger Parameters',
        contractAddress: 'ERC-8004 Agent Contract',
        ownerAddress: 'Agent Deployer',
      },
      actions: {
        runCycleNow: 'Trigger Execution Cycle',
        runningCycle: 'Executing Cycle...',
        pauseAgent: 'Pause Agent',
        resumeAgent: 'Resume Agent',
        terminateAgent: 'Terminate & Release Escrow',
        deleteAgent: 'Delete Agent Record',
        backToMarketplace: 'Back to Marketplace',
      },
      terminateDialog: {
        title: 'Terminate Autonomous Contract',
        description: (name?: string) =>
          name
            ? `Are you sure you want to terminate the autonomous contract for "${name}"? Unspent simulation escrow balance will be returned to your wallet.`
            : 'Are you sure you want to terminate this autonomous contract? Unspent simulation escrow balance will be returned to your wallet.',
        confirm: 'Terminate Agent',
        cancel: 'Cancel',
      },
      deleteDialog: {
        title: 'Delete Agent Record',
        description: (name?: string) =>
          name
            ? `Are you sure you want to permanently delete "${name}" and all historical execution logs from your workspace? This action cannot be undone.`
            : 'Are you sure you want to permanently delete this agent and all historical execution logs from your workspace? This action cannot be undone.',
        confirm: 'Delete Record',
        cancel: 'Cancel',
      },
      logs: {
        emptyTitle: 'No Execution Logs Recorded',
        emptyDesc: 'Agent will log heartbeat cycles, tool executions, and simulated receipts here.',
        simulatedBscScan: 'Simulated BscScan Receipt',
        viewReceipt: 'View Tx',
      },
    },
  },
} as const;
