'use client';

import React, { memo } from 'react';
import { Info } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export interface HireStepBudgetProps {
  budgetBnb: number;
  onBudgetChange: (val: number) => void;
}

const PRESET_BUDGETS = [1.0, 2.5, 5.0, 10.0];

export const HireStepBudget = memo(function HireStepBudget({
  budgetBnb,
  onBudgetChange,
}: HireStepBudgetProps) {
  return (
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
            onChange={(e) => onBudgetChange(Number(e.target.value))}
            className="flex-1 h-9 px-3 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle focus:border-theme-brand-binance/60 text-xs font-mono font-bold text-theme-text-primary outline-none"
          />
          <div className="h-9 px-3 rounded-lg bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center font-bold text-xs text-theme-brand-binance font-mono">
            simBNB
          </div>
        </div>

        {/* Preset chips */}
        <div className="flex items-center gap-2 pt-1">
          {PRESET_BUDGETS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onBudgetChange(val)}
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
  );
});
