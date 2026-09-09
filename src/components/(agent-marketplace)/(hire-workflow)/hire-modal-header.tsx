'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { tapScalePill } from '@/constants/animation';

export interface HireModalHeaderProps {
  name: string;
  tokenId: string;
  imageUrl?: string | null;
  onClose: () => void;
}

export const HireModalHeader = memo(function HireModalHeader({
  name,
  tokenId,
  imageUrl,
  onClose,
}: HireModalHeaderProps) {
  return (
    <div className="p-4 sm:p-5 border-b border-theme-border-subtle flex items-start justify-between gap-4 bg-theme-bg-surface shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-11 rounded-xl bg-theme-bg-elevated border border-theme-border-subtle flex items-center justify-center font-bold text-xs text-theme-brand-binance shrink-0 overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} className="size-full object-cover" />
          ) : (
            <span>{name.slice(0, 2).toUpperCase()}</span>
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
            {APP_CONTENT.hiredAgents.modal.subtitle(name, tokenId)}
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
  );
});
