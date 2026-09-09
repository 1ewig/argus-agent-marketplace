'use client';

import React, { memo } from 'react';
import { Check, Folder } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { ICON_MAP } from './filter-icon-map';
import type { CategoryKey } from '@/lib/8004scan/types';

export interface CategoryItemProps {
  categoryKey: CategoryKey;
  label: string;
  iconName?: string;
  isSelected: boolean;
  isMandatory?: boolean;
  onSelect: (key: CategoryKey) => void;
}

export const CategoryItem = memo(function CategoryItem({
  categoryKey,
  label,
  iconName,
  isSelected,
  isMandatory,
  onSelect,
}: CategoryItemProps) {
  const Icon = (iconName && ICON_MAP[iconName]) ? ICON_MAP[iconName] : Folder;

  return (
    <button
      type="button"
      onClick={() => onSelect(categoryKey)}
      className={`h-8 w-full px-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors text-left ${
        isSelected
          ? 'bg-theme-bg-elevated text-theme-brand-binance font-semibold'
          : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-elevated/50'
      }`}
    >
      <Icon
        className={`size-3.5 shrink-0 ${
          isSelected ? 'text-theme-brand-binance' : 'text-theme-text-muted'
        }`}
      />
      <span className="flex-1 truncate">{label}</span>
      {isMandatory && (
        <span className="text-3xs font-medium px-1.5 py-0.2 rounded bg-theme-brand-binance/15 text-theme-brand-binance shrink-0">
          {APP_CONTENT.marketplace.tabs.coreTracksBadge}
        </span>
      )}
      {isSelected && (
        <Check className="size-3.5 text-theme-brand-binance shrink-0" />
      )}
    </button>
  );
});
