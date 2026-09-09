'use client';

import React, { memo, useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Folder, Search } from 'lucide-react';
import { APP_CONTENT } from '@/constants/content';
import { CATEGORIES, PRIMARY_PILLARS } from '@/lib/8004scan/categories';
import type { CategoryKey } from '@/lib/8004scan/types';
import { ICON_MAP } from './filter-icon-map';
import { CategoryItem } from './category-item';

export interface CategoryDropdownProps {
  currentCategory: CategoryKey;
  onSelectCategory: (category: CategoryKey) => void;
  isOpen: boolean;
  onToggleOpen: (open: boolean) => void;
}

export const CategoryDropdown = memo(function CategoryDropdown({
  currentCategory,
  onSelectCategory,
  isOpen,
  onToggleOpen,
}: CategoryDropdownProps) {
  const [categorySearch, setCategorySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onToggleOpen(false);
        setCategorySearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onToggleOpen]);

  const activeCategory = CATEGORIES.find((c) => c.key === currentCategory);
  const isCategoryFiltered = Boolean(activeCategory && activeCategory.key !== 'all');
  const categoryLabel = activeCategory
    ? APP_CONTENT.marketplace.tabs[
        activeCategory.key as keyof typeof APP_CONTENT.marketplace.tabs
      ] || activeCategory.label
    : APP_CONTENT.marketplace.tabs.allCategories || 'All Categories';

  const CategoryTriggerIcon = activeCategory
    ? ICON_MAP[activeCategory.icon] ?? Folder
    : Folder;

  const primaryPillarsList = useMemo(
    () => PRIMARY_PILLARS.filter((p) => p.key !== 'all'),
    [],
  );

  const specializedCategoriesList = useMemo(
    () =>
      CATEGORIES.filter(
        (c) => c.key !== 'all' && !PRIMARY_PILLARS.some((p) => p.key === c.key),
      ),
    [],
  );

  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    const nonAllCategories = CATEGORIES.filter((c) => c.key !== 'all');
    if (!query) return nonAllCategories;

    return nonAllCategories.filter((cat) => {
      const label = (
        APP_CONTENT.marketplace.tabs[
          cat.key as keyof typeof APP_CONTENT.marketplace.tabs
        ] || cat.label
      ).toLowerCase();
      return label.includes(query) || cat.key.toLowerCase().includes(query);
    });
  }, [categorySearch]);

  const handleSelect = (key: CategoryKey) => {
    onSelectCategory(key);
    onToggleOpen(false);
    setCategorySearch('');
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          onToggleOpen(!isOpen);
          setCategorySearch('');
        }}
        className={`h-7.5 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all border ${
          isCategoryFiltered
            ? 'bg-theme-bg-elevated text-theme-brand-binance border-theme-brand-binance/35 font-semibold'
            : 'bg-theme-bg-elevated/40 text-theme-text-secondary hover:text-theme-text-primary border-theme-border-subtle'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <CategoryTriggerIcon
          className={`size-3.5 shrink-0 ${
            isCategoryFiltered ? 'text-theme-brand-binance' : 'text-theme-text-muted'
          }`}
        />
        <span className="text-theme-text-muted">
          {APP_CONTENT.marketplace.tabs.categoryBy}:
        </span>
        <span className="truncate max-w-[120px]">{categoryLabel}</span>
        <ChevronDown
          className={`size-3 text-theme-text-muted transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-theme-bg-surface/95 backdrop-blur-md border border-theme-border-subtle rounded-xl shadow-2xl z-30 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Explorer-style Search Box */}
          <div className="p-1.5 border-b border-theme-border-subtle/50">
            <div className="relative flex items-center">
              <Search className="size-3 text-theme-text-muted absolute left-2 pointer-events-none" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder={APP_CONTENT.marketplace.tabs.filterPlaceholder}
                autoFocus
                className="w-full pl-6.5 pr-2 py-1 text-xs bg-theme-bg-elevated/50 border border-theme-border-subtle/40 rounded-md text-theme-text-primary placeholder:text-theme-text-muted focus:outline-none focus:border-theme-brand-binance/50 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Explorer Header */}
          <div className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-wider text-theme-text-muted flex items-center justify-between border-b border-theme-border-subtle/30 bg-theme-bg-elevated/20">
            <span>{APP_CONTENT.marketplace.tabs.categoryBy}</span>
            <span>{filteredCategories.length}</span>
          </div>

          {/* Options List */}
          <div className="max-h-72 overflow-y-auto p-1 flex flex-col gap-0.5">
            {!categorySearch ? (
              <>
                {/* 1. Pinned 'All Agents' */}
                <CategoryItem
                  categoryKey="all"
                  label={APP_CONTENT.marketplace.tabs.allCategories}
                  iconName="Layers"
                  isSelected={currentCategory === 'all'}
                  onSelect={handleSelect}
                />

                <div className="h-px bg-theme-border-subtle/40 my-1" />

                {/* 2. Core Pillars Section */}
                <div className="px-2 py-1 text-[10px] uppercase font-semibold tracking-wider text-theme-text-muted/80">
                  {APP_CONTENT.marketplace.tabs.primaryPillarsHeader}
                </div>

                {primaryPillarsList.map((cat) => (
                  <CategoryItem
                    key={cat.key}
                    categoryKey={cat.key}
                    label={
                      APP_CONTENT.marketplace.tabs[
                        cat.key as keyof typeof APP_CONTENT.marketplace.tabs
                      ] || cat.label
                    }
                    iconName={cat.icon}
                    isSelected={currentCategory === cat.key}
                    isMandatory={cat.isMandatory}
                    onSelect={handleSelect}
                  />
                ))}

                <div className="h-px bg-theme-border-subtle/40 my-1" />

                {/* 3. Specialized Domains Section */}
                <div className="px-2 py-1 text-[10px] uppercase font-semibold tracking-wider text-theme-text-muted/80">
                  {APP_CONTENT.marketplace.tabs.subCategoriesHeader}
                </div>

                {specializedCategoriesList.map((cat) => (
                  <CategoryItem
                    key={cat.key}
                    categoryKey={cat.key}
                    label={
                      APP_CONTENT.marketplace.tabs[
                        cat.key as keyof typeof APP_CONTENT.marketplace.tabs
                      ] || cat.label
                    }
                    iconName={cat.icon}
                    isSelected={currentCategory === cat.key}
                    onSelect={handleSelect}
                  />
                ))}
              </>
            ) : (
              filteredCategories.map((cat) => (
                <CategoryItem
                  key={cat.key}
                  categoryKey={cat.key}
                  label={
                    APP_CONTENT.marketplace.tabs[
                      cat.key as keyof typeof APP_CONTENT.marketplace.tabs
                    ] || cat.label
                  }
                  iconName={cat.icon}
                  isSelected={currentCategory === cat.key}
                  onSelect={handleSelect}
                />
              ))
            )}

            {categorySearch && filteredCategories.length === 0 && (
              <div className="py-4 px-2 text-center text-xs text-theme-text-muted">
                {APP_CONTENT.marketplace.tabs.noMatch}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
