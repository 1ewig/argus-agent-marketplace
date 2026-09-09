'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';

export interface HireModalFooterProps {
  step: 1 | 2 | 3;
  isDeploying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onConfirmDeploy: () => void;
}

export const HireModalFooter = memo(function HireModalFooter({
  step,
  isDeploying,
  onPrev,
  onNext,
  onClose,
  onConfirmDeploy,
}: HireModalFooterProps) {
  return (
    <div className="p-4 sm:p-5 border-t border-theme-border-subtle bg-theme-bg-surface flex items-center justify-between gap-3 shrink-0">
      {step > 1 ? (
        <button
          type="button"
          onClick={onPrev}
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
          onClick={onNext}
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
          onClick={onConfirmDeploy}
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
  );
});
