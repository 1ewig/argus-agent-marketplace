'use client';

import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Shield,
  CandlestickChart,
  Coins,
  Eye,
  Bot,
  Info,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';
import { hireAgent } from '@/lib/db';
import type { ScanAgentItem } from '@/lib/8004scan/types';
import type { StrategyType, HiredAgentRecord } from '@/lib/types';

export interface HireAgentModalProps {
  agent: ScanAgentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (hiredAgent: HiredAgentRecord) => void;
}

const STRATEGY_OPTIONS: Array<{
  type: StrategyType;
  label: string;
  desc: string;
  defaultTitle: string;
  defaultTarget: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    type: 'health_factor',
    label: APP_CONTENT.hiredAgents.modal.strategies.healthFactor.label,
    desc: APP_CONTENT.hiredAgents.modal.strategies.healthFactor.desc,
    defaultTitle: 'Venus Liquidation Sentinel',
    defaultTarget: 'Venus Protocol',
    icon: Shield,
  },
  {
    type: 'grid_trading',
    label: APP_CONTENT.hiredAgents.modal.strategies.gridTrading.label,
    desc: APP_CONTENT.hiredAgents.modal.strategies.gridTrading.desc,
    defaultTitle: 'BNB/USDT Grid Maker',
    defaultTarget: 'BNB/USDT (PancakeSwap)',
    icon: CandlestickChart,
  },
  {
    type: 'yield_staking',
    label: APP_CONTENT.hiredAgents.modal.strategies.yieldStaking.label,
    desc: APP_CONTENT.hiredAgents.modal.strategies.yieldStaking.desc,
    defaultTitle: 'slisBNB Yield Maximizer',
    defaultTarget: 'Lista DAO',
    icon: Coins,
  },
  {
    type: 'monitoring',
    label: APP_CONTENT.hiredAgents.modal.strategies.monitoring.label,
    desc: APP_CONTENT.hiredAgents.modal.strategies.monitoring.desc,
    defaultTitle: 'Whale & Depth Sentinel',
    defaultTarget: 'BNB/USDT',
    icon: Eye,
  },
  {
    type: 'custom',
    label: APP_CONTENT.hiredAgents.modal.strategies.custom.label,
    desc: APP_CONTENT.hiredAgents.modal.strategies.custom.desc,
    defaultTitle: 'Autonomous Mission',
    defaultTarget: 'BNB Smart Chain',
    icon: Bot,
  },
];

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
          customPrompt: selectedStrategy === 'custom' ? customPrompt : undefined,
        },
      });

      // Small delay for tactile response
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
          <div className="p-4 sm:p-5 border-b border-theme-border-subtle flex items-start justify-between gap-4 bg-theme-bg-surface shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-11 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center font-bold text-xs text-theme-brand-binance shrink-0 overflow-hidden">
                {agent.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={agent.image_url} alt={displayName} className="size-full object-cover" />
                ) : (
                  <span>{displayName.slice(0, 2).toUpperCase()}</span>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-theme-text-primary truncate">
                    {APP_CONTENT.hiredAgents.modal.title}
                  </h2>
                  <span className="text-3xs font-extrabold px-1.5 py-0.5 rounded-full bg-theme-brand-binance/15 text-theme-brand-binance border border-theme-brand-binance/30 uppercase">
                    Simulation
                  </span>
                </div>
                <p className="text-2xs text-theme-text-muted mt-0.5 truncate">
                  {APP_CONTENT.hiredAgents.modal.subtitle(displayName, agent.token_id)}
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              whileTap={tapScalePill}
              onClick={onClose}
              className="size-8 rounded-lg bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 flex items-center justify-center text-theme-text-muted hover:text-theme-text-primary cursor-pointer transition-colors shrink-0"
            >
              <X className="size-4" />
            </motion.button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="px-5 py-2.5 bg-theme-bg-elevated/30 border-b border-theme-border-subtle/50 flex items-center justify-between text-2xs font-semibold">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                step === 1 ? 'text-theme-brand-binance font-bold' : 'text-theme-text-muted'
              }`}
            >
              <span className="size-5 rounded-full bg-theme-bg-elevated border border-current flex items-center justify-center text-3xs font-mono">
                1
              </span>
              <span>{APP_CONTENT.hiredAgents.modal.step1Title}</span>
            </button>

            <ChevronRight className="size-3 text-theme-border-subtle" />

            <button
              type="button"
              onClick={() => setStep(2)}
              className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                step === 2 ? 'text-theme-brand-binance font-bold' : 'text-theme-text-muted'
              }`}
            >
              <span className="size-5 rounded-full bg-theme-bg-elevated border border-current flex items-center justify-center text-3xs font-mono">
                2
              </span>
              <span>{APP_CONTENT.hiredAgents.modal.step2Title}</span>
            </button>

            <ChevronRight className="size-3 text-theme-border-subtle" />

            <button
              type="button"
              onClick={() => setStep(3)}
              className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                step === 3 ? 'text-theme-brand-binance font-bold' : 'text-theme-text-muted'
              }`}
            >
              <span className="size-5 rounded-full bg-theme-bg-elevated border border-current flex items-center justify-center text-3xs font-mono">
                3
              </span>
              <span>{APP_CONTENT.hiredAgents.modal.step3Title}</span>
            </button>
          </div>

          {/* Scrollable Step Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 text-xs">
            {/* STEP 1: Mission & Strategy */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                    {APP_CONTENT.hiredAgents.modal.fields.strategyLabel}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STRATEGY_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = selectedStrategy === opt.type;
                      return (
                        <div
                          key={opt.type}
                          onClick={() => handleStrategyChange(opt.type)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5 ${
                            isSelected
                              ? 'bg-theme-bg-elevated border-theme-brand-binance/60 ring-1 ring-theme-brand-binance/30'
                              : 'bg-theme-bg-elevated/40 border-theme-border-subtle hover:border-theme-border-subtle/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon
                                className={`size-3.5 ${
                                  isSelected ? 'text-theme-brand-binance' : 'text-theme-text-muted'
                                }`}
                              />
                              <span
                                className={`text-xs font-bold ${
                                  isSelected ? 'text-theme-text-primary' : 'text-theme-text-secondary'
                                }`}
                              >
                                {opt.label}
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="size-3.5 text-theme-brand-binance" />
                            )}
                          </div>
                          <p className="text-3xs text-theme-text-muted leading-relaxed line-clamp-2">
                            {opt.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mandate Name & Protocol */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                      {APP_CONTENT.hiredAgents.modal.fields.missionTitleLabel}
                    </label>
                    <input
                      type="text"
                      value={missionTitle}
                      onChange={(e) => setMissionTitle(e.target.value)}
                      placeholder={APP_CONTENT.hiredAgents.modal.fields.missionTitlePlaceholder}
                      className="h-8.5 px-3 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle focus:border-theme-brand-binance/60 text-xs text-theme-text-primary outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                      {APP_CONTENT.hiredAgents.modal.fields.targetLabel}
                    </label>
                    <input
                      type="text"
                      value={targetProtocol}
                      onChange={(e) => setTargetProtocol(e.target.value)}
                      placeholder={APP_CONTENT.hiredAgents.modal.fields.targetPlaceholder}
                      className="h-8.5 px-3 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle focus:border-theme-brand-binance/60 text-xs text-theme-text-primary outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Specific Strategy Parameters */}
                {selectedStrategy === 'health_factor' && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-2xs">
                      <span className="font-bold uppercase tracking-wider text-theme-text-muted">
                        {APP_CONTENT.hiredAgents.modal.fields.healthThresholdLabel}
                      </span>
                      <span className="font-mono font-bold text-theme-brand-binance">
                        {healthThreshold}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={95}
                      step={1}
                      value={healthThreshold}
                      onChange={(e) => setHealthThreshold(Number(e.target.value))}
                      className="w-full accent-theme-brand-binance cursor-pointer"
                    />
                  </div>
                )}

                {selectedStrategy === 'grid_trading' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                        {APP_CONTENT.hiredAgents.modal.fields.gridLowerLabel}
                      </label>
                      <input
                        type="number"
                        value={gridLower}
                        onChange={(e) => setGridLower(Number(e.target.value))}
                        className="h-8.5 px-3 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle text-xs text-theme-text-primary outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                        {APP_CONTENT.hiredAgents.modal.fields.gridUpperLabel}
                      </label>
                      <input
                        type="number"
                        value={gridUpper}
                        onChange={(e) => setGridUpper(Number(e.target.value))}
                        className="h-8.5 px-3 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle text-xs text-theme-text-primary outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedStrategy === 'custom' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                      {APP_CONTENT.hiredAgents.modal.fields.customPromptLabel}
                    </label>
                    <textarea
                      rows={3}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder={APP_CONTENT.hiredAgents.modal.fields.customPromptPlaceholder}
                      className="p-2.5 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle focus:border-theme-brand-binance/60 text-xs text-theme-text-primary outline-none resize-none"
                    />
                  </div>
                )}

                {/* Execution Cadence */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                    {APP_CONTENT.hiredAgents.modal.fields.intervalLabel}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 15, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setIntervalMinutes(mins)}
                        className={`h-8 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                          intervalMinutes === mins
                            ? 'bg-theme-bg-elevated text-theme-brand-binance border-theme-brand-binance/50'
                            : 'bg-theme-bg-elevated/40 text-theme-text-secondary border-theme-border-subtle'
                        }`}
                      >
                        {mins === 5 ? '5 Min' : mins === 15 ? '15 Min' : '1 Hour'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Risk Boundaries & Budget */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                {/* Simulation Notice Banner */}
                <div className="bg-theme-brand-binance/10 border border-theme-brand-binance/25 rounded-xl p-3.5 flex items-start gap-3">
                  <Info className="size-4 text-theme-brand-binance shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-theme-brand-binance">
                      {APP_CONTENT.hiredAgents.modal.fields.simulationNoticeTitle}
                    </span>
                    <p className="text-2xs text-theme-text-secondary leading-relaxed">
                      {APP_CONTENT.hiredAgents.modal.fields.simulationNoticeDesc}
                    </p>
                  </div>
                </div>

                {/* Budget input */}
                <div className="flex flex-col gap-2">
                  <label className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                    {APP_CONTENT.hiredAgents.modal.fields.budgetLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={0.5}
                      min={0.5}
                      max={50}
                      value={budgetBnb}
                      onChange={(e) => setBudgetBnb(Number(e.target.value))}
                      className="flex-1 h-9 px-3 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle focus:border-theme-brand-binance/60 text-xs font-mono font-bold text-theme-text-primary outline-none"
                    />
                    <div className="h-9 px-3 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center font-bold text-xs text-theme-brand-binance font-mono">
                      simBNB
                    </div>
                  </div>

                  {/* Preset chips */}
                  <div className="flex items-center gap-2 pt-1">
                    {[1.0, 2.5, 5.0, 10.0].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBudgetBnb(val)}
                        className={`h-6 px-2.5 rounded-md text-3xs font-mono font-semibold border cursor-pointer transition-colors ${
                          budgetBnb === val
                            ? 'bg-theme-brand-binance text-theme-bg-overlay border-theme-brand-binance'
                            : 'bg-theme-bg-elevated text-theme-text-secondary border-theme-border-subtle hover:text-theme-text-primary'
                        }`}
                      >
                        {val} BNB
                      </button>
                    ))}
                  </div>

                  <span className="text-3xs text-theme-text-muted mt-1 leading-relaxed">
                    {APP_CONTENT.hiredAgents.modal.fields.budgetHelp}
                  </span>
                </div>
              </div>
            )}

            {/* STEP 3: Escrow Authorization & Summary */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="bg-theme-bg-elevated/40 border border-theme-border-subtle rounded-xl p-4 flex flex-col gap-3">
                  <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
                    {APP_CONTENT.hiredAgents.modal.review.summaryTitle}
                  </span>

                  <div className="flex items-center justify-between text-2xs py-1 border-b border-theme-border-subtle/50">
                    <span className="text-theme-text-muted">
                      {APP_CONTENT.hiredAgents.modal.review.agentLabel}
                    </span>
                    <span className="font-bold text-theme-text-primary">
                      {displayName} (#{agent.token_id})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-2xs py-1 border-b border-theme-border-subtle/50">
                    <span className="text-theme-text-muted">
                      {APP_CONTENT.hiredAgents.modal.review.strategyLabel}
                    </span>
                    <span className="font-semibold text-theme-brand-binance">
                      {missionTitle} ({targetProtocol})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-2xs py-1 border-b border-theme-border-subtle/50">
                    <span className="text-theme-text-muted">
                      {APP_CONTENT.hiredAgents.modal.review.intervalLabel}
                    </span>
                    <span className="text-theme-text-secondary font-mono">
                      Every {intervalMinutes} minutes
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-2xs py-1 border-b border-theme-border-subtle/50">
                    <span className="text-theme-text-muted">
                      {APP_CONTENT.hiredAgents.modal.review.escrowLabel}
                    </span>
                    <span className="font-mono font-bold text-theme-text-primary">
                      {budgetBnb} simBNB (Simulation Escrow)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-2xs py-1">
                    <span className="text-theme-text-muted">
                      {APP_CONTENT.hiredAgents.modal.review.networkLabel}
                    </span>
                    <span className="text-theme-text-secondary font-mono">
                      {APP_CONTENT.hiredAgents.modal.review.networkValue}
                    </span>
                  </div>
                </div>

                <div className="text-3xs text-theme-text-muted bg-theme-bg-elevated/20 p-3 rounded-lg border border-theme-border-subtle/40 flex items-center justify-between">
                  <span>Protocol Standard</span>
                  <span className="font-mono text-theme-text-secondary">
                    {APP_CONTENT.hiredAgents.modal.review.protocolStandard}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-4 sm:p-5 border-t border-theme-border-subtle bg-theme-bg-surface flex items-center justify-between gap-3 shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                className="h-9 px-4 rounded-xl bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 border border-theme-border-subtle text-xs font-semibold text-theme-text-secondary hover:text-theme-text-primary flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ChevronLeft className="size-3.5" />
                <span>{APP_CONTENT.hiredAgents.modal.prevStep}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-xl bg-theme-bg-elevated hover:bg-theme-bg-elevated/80 border border-theme-border-subtle text-xs font-semibold text-theme-text-secondary cursor-pointer transition-colors"
              >
                <span>{APP_CONTENT.hiredAgents.modal.closeModal}</span>
              </button>
            )}

            {step < 3 ? (
              <motion.button
                type="button"
                whileTap={tapScalePill}
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                className="h-9 px-4 rounded-xl bg-theme-brand-binance text-theme-bg-overlay text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs hover:opacity-95 transition-opacity"
              >
                <span>{APP_CONTENT.hiredAgents.modal.nextStep}</span>
                <ChevronRight className="size-3.5" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileTap={isDeploying ? undefined : tapScalePill}
                disabled={isDeploying}
                onClick={handleConfirmDeploy}
                className="h-9 px-5 rounded-xl bg-theme-brand-binance text-theme-bg-overlay text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs hover:opacity-95 disabled:opacity-50 transition-opacity"
              >
                <CheckCircle2 className="size-4" />
                <span>
                  {isDeploying
                    ? APP_CONTENT.hiredAgents.modal.deploying
                    : APP_CONTENT.hiredAgents.modal.confirmHire}
                </span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
