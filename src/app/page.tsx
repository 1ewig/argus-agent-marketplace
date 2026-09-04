'use client';

import React, { useState } from 'react';
import { StageViewSwitcher, type StageViewMode } from '@/components/(dashboard)/stage-view-switcher';
import { MarketChartView } from '@/components/(dashboard)/market-chart-view';
import { AccountPortfolioCard } from '@/components/(dashboard)/cards/account-portfolio-card';
import { ActiveTradesCard } from '@/components/(dashboard)/cards/active-trades-card';
import { DailyMarketCard } from '@/components/(dashboard)/cards/daily-market-card';
import { ChatWindow } from '@/components/(dashboard)/chat/chat-window';
import { APP_CONTENT } from '@/constants/content';
import { useExecutionMode } from '@/hooks';

export default function Home() {
  const { executionMode } = useExecutionMode('simulation');
  const [stageView, setStageView] = useState<StageViewMode>('agent');

  return (
    <main className="h-screen w-screen pt-navbar flex flex-col overflow-hidden bg-theme-bg-base">
      {/* Dynamic Multi-Column Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-spacing-md lg:gap-spacing-lg px-spacing-md sm:px-spacing-lg lg:px-spacing-xl py-spacing-sm sm:py-spacing-md lg:py-spacing-lg min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left Hero Stage: Switcher, Chat/Chart Canvas, Bottom Metrics (~65% width) */}
        <section className="lg:col-span-8 flex flex-col h-full min-h-0 gap-spacing-sm sm:gap-spacing-md">
          {/* Stage Title & View Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-spacing-sm shrink-0">
            <div>
              <span className="text-2xs font-extrabold uppercase tracking-widest text-theme-text-muted">
                {APP_CONTENT.stage.category}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-theme-text-primary tracking-tight">
                {APP_CONTENT.stage.defaultSymbol}
              </h1>
              <p className="text-2xs text-theme-text-secondary mt-0.5 hidden sm:block">
                {APP_CONTENT.stage.defaultSubtitle}
              </p>
            </div>

            {/* View Switcher: Agent Chat vs Trading Chart */}
            <StageViewSwitcher
              viewMode={stageView}
              onViewModeChange={setStageView}
            />
          </div>

          {/* Central Stage View (Agent Chat or Market Chart) */}
          <div className="flex-1 min-h-[420px] lg:min-h-0 overflow-hidden">
            {stageView === 'agent' ? (
              <ChatWindow mode={executionMode} />
            ) : (
              <MarketChartView />
            )}
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
