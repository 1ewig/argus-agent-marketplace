'use client';

import React from 'react';
import { DashboardClient } from '@/components/(dashboard)/dashboard-client';
import { useAppStore } from '@/stores/app-store';

export default function Home() {
  const executionMode = useAppStore((state) => state.executionMode);

  return (
    <main className="flex-1 min-h-0 w-full flex flex-col overflow-hidden bg-theme-bg-base">
      <DashboardClient mode={executionMode} />
    </main>
  );
}
