'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hireAgent } from '@/lib/db';
import {
  HireModalHeader,
  HireModalStepper,
  HireStepStrategy,
  HireStepBudget,
  HireStepReview,
  HireModalFooter,
  STRATEGY_OPTIONS,
} from './';
import type { ScanAgentItem } from '@/lib/8004scan/types';
import type { StrategyType, HiredAgentRecord } from '@/lib/types';

export interface HireAgentModalProps {
  agent: ScanAgentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (hiredAgent: HiredAgentRecord) => void;
}

export const HireAgentModal = memo(function HireAgentModal({
  agent,
  isOpen,
  onClose,
  onSuccess,
}: HireAgentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>('health_factor');
  const [missionTitle, setMissionTitle] = useState('Venus Liquidation Sentinel');
  const [targetProtocol, setTargetProtocol] = useState('Venus Protocol');
  const [intervalMinutes, setIntervalMinutes] = useState<number>(5);
  const [healthThreshold, setHealthThreshold] = useState<number>(80);
  const [gridUpper, setGridUpper] = useState<number>(640);
  const [gridLower, setGridLower] = useState<number>(580);
  const [rebalanceThreshold, setRebalanceThreshold] = useState<number>(3);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [budgetBnb, setBudgetBnb] = useState<number>(2.0);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  const handleStrategyChange = (type: StrategyType) => {
    setSelectedStrategy(type);
    const option = STRATEGY_OPTIONS.find((s) => s.type === type);
    if (option) {
      setMissionTitle(option.defaultTitle);
      setTargetProtocol(option.defaultTarget);
    }
  };

  const handleConfirmDeploy = useCallback(async () => {
    if (!agent || isDeploying) return;
    setIsDeploying(true);

    try {
      const record = await hireAgent({
        agentTokenId: agent.token_id,
        name: agent.name?.trim() || `Agent #${agent.token_id}`,
        imageUrl: agent.image_url,
        categoryKey: selectedStrategy || 'risk',
        contractAddress: agent.contract_address,
        ownerAddress: agent.owner_address,
        allocatedBudget: budgetBnb,
        budgetAsset: 'simBNB',
        mission: {
          strategyType: selectedStrategy,
          missionTitle: missionTitle.trim() || 'Autonomous Strategy',
          targetPairOrProtocol: targetProtocol.trim() || 'BNB Chain',
          executionIntervalMinutes: intervalMinutes,
          healthFactorThreshold: selectedStrategy === 'health_factor' ? healthThreshold : undefined,
          gridUpperPrice: selectedStrategy === 'grid_trading' ? gridUpper : undefined,
          gridLowerPrice: selectedStrategy === 'grid_trading' ? gridLower : undefined,
          rebalanceThresholdPct: selectedStrategy === 'rebalancing' ? rebalanceThreshold : undefined,
          customPrompt: selectedStrategy === 'custom' ? customPrompt : undefined,
        },
      });

      // Small tactile delay before closing and notifying
      setTimeout(() => {
        setIsDeploying(false);
        onClose();
        if (onSuccess) {
          onSuccess(record);
        }
      }, 600);
    } catch {
      setIsDeploying(false);
    }
  }, [
    agent,
    isDeploying,
    budgetBnb,
    selectedStrategy,
    missionTitle,
    targetProtocol,
    intervalMinutes,
    healthThreshold,
    gridUpper,
    gridLower,
    rebalanceThreshold,
    customPrompt,
    onClose,
    onSuccess,
  ]);

  if (!isOpen || !agent) return null;

  const displayName = agent.name?.trim() || `Agent #${agent.token_id}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-theme-bg-overlay/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl max-h-[90vh] bg-theme-bg-surface border border-theme-border-subtle rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <HireModalHeader
            name={displayName}
            tokenId={agent.token_id}
            chainId={agent.chain_id}
            imageUrl={agent.image_url}
            onClose={onClose}
          />

          {/* Stepper Progress Bar */}
          <HireModalStepper
            step={step}
            onSelectStep={setStep}
          />

          {/* Scrollable Step Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 text-xs">
            {step === 1 && (
              <HireStepStrategy
                selectedStrategy={selectedStrategy}
                onStrategyChange={handleStrategyChange}
                missionTitle={missionTitle}
                onMissionTitleChange={setMissionTitle}
                targetProtocol={targetProtocol}
                onTargetProtocolChange={setTargetProtocol}
                intervalMinutes={intervalMinutes}
                onIntervalChange={setIntervalMinutes}
                healthThreshold={healthThreshold}
                onHealthThresholdChange={setHealthThreshold}
                gridUpper={gridUpper}
                onGridUpperChange={setGridUpper}
                gridLower={gridLower}
                onGridLowerChange={setGridLower}
                rebalanceThreshold={rebalanceThreshold}
                onRebalanceThresholdChange={setRebalanceThreshold}
                customPrompt={customPrompt}
                onCustomPromptChange={setCustomPrompt}
              />
            )}

            {step === 2 && (
              <HireStepBudget
                budgetBnb={budgetBnb}
                onBudgetChange={setBudgetBnb}
              />
            )}

            {step === 3 && (
              <HireStepReview
                displayName={displayName}
                tokenId={agent.token_id}
                missionTitle={missionTitle}
                targetProtocol={targetProtocol}
                intervalMinutes={intervalMinutes}
                budgetBnb={budgetBnb}
              />
            )}
          </div>

          {/* Footer Navigation */}
          <HireModalFooter
            step={step}
            isDeploying={isDeploying}
            onPrev={() => setStep((s) => (s - 1) as 1 | 2)}
            onNext={() => setStep((s) => (s + 1) as 2 | 3)}
            onClose={onClose}
            onConfirmDeploy={handleConfirmDeploy}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
