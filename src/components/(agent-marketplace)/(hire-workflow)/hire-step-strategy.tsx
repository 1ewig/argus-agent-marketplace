'use client';

import React, { memo } from 'react';
import {
  CheckCircle2,
  Shield,
  CandlestickChart,
  Coins,
  RefreshCcw,
  Bot,
} from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import type { StrategyType } from '@/lib/types';

export interface StrategyOption {
  type: StrategyType;
  label: string;
  desc: string;
  defaultTitle: string;
  defaultTarget: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const STRATEGY_OPTIONS: StrategyOption[] = [
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
    type: 'rebalancing',
    label: APP_CONTENT.hiredAgents.modal.strategies.rebalancing.label,
    desc: APP_CONTENT.hiredAgents.modal.strategies.rebalancing.desc,
    defaultTitle: 'PancakeSwap v3 LP Rebalancer',
    defaultTarget: 'CAKE/BNB 0.25% (PancakeSwap)',
    icon: RefreshCcw,
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

export interface HireStepStrategyProps {
  selectedStrategy: StrategyType;
  onStrategyChange: (type: StrategyType) => void;
  missionTitle: string;
  onMissionTitleChange: (val: string) => void;
  targetProtocol: string;
  onTargetProtocolChange: (val: string) => void;
  intervalMinutes: number;
  onIntervalChange: (val: number) => void;
  healthThreshold: number;
  onHealthThresholdChange: (val: number) => void;
  gridUpper: number;
  onGridUpperChange: (val: number) => void;
  gridLower: number;
  onGridLowerChange: (val: number) => void;
  rebalanceThreshold: number;
  onRebalanceThresholdChange: (val: number) => void;
  customPrompt: string;
  onCustomPromptChange: (val: string) => void;
}

export const HireStepStrategy = memo(function HireStepStrategy({
  selectedStrategy,
  onStrategyChange,
  missionTitle,
  onMissionTitleChange,
  targetProtocol,
  onTargetProtocolChange,
  intervalMinutes,
  onIntervalChange,
  healthThreshold,
  onHealthThresholdChange,
  gridUpper,
  onGridUpperChange,
  gridLower,
  onGridLowerChange,
  rebalanceThreshold,
  onRebalanceThresholdChange,
  customPrompt,
  onCustomPromptChange,
}: HireStepStrategyProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Strategy Templates Selector */}
      <div className="flex flex-col gap-2">
        <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
          {APP_CONTENT.hiredAgents.modal.fields.strategyLabel}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {STRATEGY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedStrategy === opt.type;
            const isCustom = opt.type === 'custom';
            return (
              <div
                key={opt.type}
                onClick={() => onStrategyChange(opt.type)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5 ${
                  isCustom ? 'sm:col-span-2' : ''
                } ${
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

      {/* Mandate Name & Protocol Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
            {APP_CONTENT.hiredAgents.modal.fields.missionTitleLabel}
          </label>
          <input
            type="text"
            value={missionTitle}
            onChange={(e) => onMissionTitleChange(e.target.value)}
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
            onChange={(e) => onTargetProtocolChange(e.target.value)}
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
            onChange={(e) => onHealthThresholdChange(Number(e.target.value))}
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
              onChange={(e) => onGridLowerChange(Number(e.target.value))}
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
              onChange={(e) => onGridUpperChange(Number(e.target.value))}
              className="h-8.5 px-3 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle text-xs text-theme-text-primary outline-none"
            />
          </div>
        </div>
      )}

      {selectedStrategy === 'rebalancing' && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-2xs">
            <span className="font-bold uppercase tracking-wider text-theme-text-muted">
              {APP_CONTENT.hiredAgents.modal.fields.rebalanceThresholdLabel}
            </span>
            <span className="font-mono font-bold text-theme-brand-binance">
              ±{rebalanceThreshold}%
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={rebalanceThreshold}
            onChange={(e) => onRebalanceThresholdChange(Number(e.target.value))}
            className="w-full accent-theme-brand-binance cursor-pointer"
          />
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
            onChange={(e) => onCustomPromptChange(e.target.value)}
            placeholder={APP_CONTENT.hiredAgents.modal.fields.customPromptPlaceholder}
            className="p-2.5 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle focus:border-theme-brand-binance/60 text-xs text-theme-text-primary outline-none resize-none"
          />
        </div>
      )}

      {/* Execution Cadence Interval */}
      <div className="flex flex-col gap-1.5">
        <span className="text-2xs font-bold uppercase tracking-wider text-theme-text-muted">
          {APP_CONTENT.hiredAgents.modal.fields.intervalLabel}
        </span>
        <div className="grid grid-cols-3 gap-2">
          {[5, 15, 60].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => onIntervalChange(mins)}
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
  );
});
