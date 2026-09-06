'use client';

import React from 'react';
import { DashboardClient } from '@/components/(dashboard)/dashboard-client';
import { SymbolSearchModal } from '@/components/modals/symbol-search-modal';
import { useAppStore } from '@/stores/app-store';
import { useUrlSymbolSync } from '@/hooks';

export default function Home() {
  useUrlSymbolSync();
  const executionMode = useAppStore((state) => state.executionMode);

  return (
    <>
      <main className="flex-1 min-h-0 w-full flex flex-col overflow-hidden bg-theme-bg-base">
        <DashboardClient mode={executionMode} />
      </main>

      {/* Global Symbol Search / Workspace Switcher Modal */}
      <SymbolSearchModal />
    </>
  );
}
