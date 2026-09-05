'use client';

import React from 'react';
import { MarketChartView } from '@/components/(dashboard)/market-chart-view';
import { ChatClient } from '@/components/(dashboard)/chat/chat-client';
import { SymbolSearchModal } from '@/components/modals/symbol-search-modal';
import { useAppStore } from '@/stores/app-store';
import { useUrlSymbolSync } from '@/hooks';

export default function Home() {
  useUrlSymbolSync();
  const executionMode = useAppStore((state) => state.executionMode);
  const stageView = useAppStore((state) => state.stageView);

  return (
    <>
      <main className="flex-1 min-h-0 w-full flex flex-col overflow-hidden bg-theme-bg-base">
        {/* Central Stage View (Zero-flash dual-render with CSS toggle) */}
        <section className="flex-1 min-h-0 overflow-hidden relative flex flex-col h-full">
          <div className={`h-full w-full ${stageView === 'agent' ? 'flex flex-col' : 'hidden'}`}>
            <ChatClient mode={executionMode} />
          </div>
          <div className={`h-full w-full p-spacing-sm sm:p-spacing-md lg:p-spacing-lg ${stageView === 'chart' ? 'flex flex-col' : 'hidden'}`}>
            <MarketChartView />
          </div>
        </section>
      </main>

      {/* Global Symbol Search / Workspace Switcher Modal */}
      <SymbolSearchModal />
    </>
  );
}

