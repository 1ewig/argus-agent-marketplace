'use client';

import React from 'react';
import { MarketChartView } from '@/components/(dashboard)/market-chart-view';
import { AccountPortfolioCard } from '@/components/(dashboard)/cards/account-portfolio-card';
import { ActiveTradesCard } from '@/components/(dashboard)/cards/active-trades-card';
import { DailyMarketCard } from '@/components/(dashboard)/cards/daily-market-card';
import { ChatClient } from '@/components/(dashboard)/chat/chat-client';
import { useAppStore } from '@/stores/app-store';

export default function Home() {
  const executionMode = useAppStore((state) => state.executionMode);
  const stageView = useAppStore((state) => state.stageView);

  return (
    <main className="flex-1 min-h-0 w-full flex flex-col overflow-hidden bg-theme-bg-base">
      {/* Dynamic Multi-Column Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-spacing-md lg:gap-spacing-lg p-spacing-sm sm:p-spacing-md lg:p-spacing-lg min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left Hero Stage: Chat/Chart Canvas (~65% width) */}
        <section className="lg:col-span-8 flex flex-col h-full min-h-0">
          {/* Central Stage View (Zero-flash dual-render with CSS toggle) */}
          <div className="flex-1 min-h-[420px] lg:min-h-0 overflow-hidden relative">
            <div className={`h-full w-full ${stageView === 'agent' ? 'flex flex-col' : 'hidden'}`}>
              <ChatClient mode={executionMode} />
            </div>
            <div className={`h-full w-full ${stageView === 'chart' ? 'flex flex-col' : 'hidden'}`}>
              <MarketChartView />
            </div>
          </div>
        </section>

        {/* Right Rail: 3 Auto-Adjusting Telemetry Cards (~35% width) */}
        <aside className="lg:col-span-4 flex flex-col gap-spacing-sm sm:gap-spacing-md h-full min-h-0 justify-between">
          <AccountPortfolioCard />
          <ActiveTradesCard />
          <DailyMarketCard />
        </aside>
      </div>
    </main>
  );
}
