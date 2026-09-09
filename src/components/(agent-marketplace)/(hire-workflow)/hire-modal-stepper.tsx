'use client';

import React, { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';

export interface HireModalStepperProps {
  step: 1 | 2 | 3;
  onSelectStep: (step: 1 | 2 | 3) => void;
}

export const HireModalStepper = memo(function HireModalStepper({
  step,
  onSelectStep,
}: HireModalStepperProps) {
  return (
    <div className="px-5 py-2.5 bg-theme-bg-elevated/30 border-b border-theme-border-subtle/50 flex items-center justify-between text-2xs font-semibold">
      <button
        type="button"
        onClick={() => onSelectStep(1)}
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
        onClick={() => onSelectStep(2)}
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
        onClick={() => onSelectStep(3)}
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
  );
});
