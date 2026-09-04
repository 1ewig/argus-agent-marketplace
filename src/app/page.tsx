'use client';

import React, { useState } from 'react';
import { NavDock, type NavTabId } from '@/components/(dashboard)/nav-dock';
import { TopNavBar } from '@/components/(dashboard)/top-nav-bar';
import { StageViewSwitcher, type StageViewMode } from '@/components/(dashboard)/stage-view-switcher';
import { MarketChartView } from '@/components/(dashboard)/market-chart-view';
import { AccountPortfolioCard } from '@/components/(dashboard)/cards/account-portfolio-card';
import { ActiveTradesCard } from '@/components/(dashboard)/cards/active-trades-card';
import { DailyMarketCard } from '@/components/(dashboard)/cards/daily-market-card';
import { ChatWindow } from '@/components/(dashboard)/chat/chat-window';
import { APP_CONTENT } from '@/constants/content';
import { useExecutionMode } from '@/hooks';

export default function Home() {
  const { executionMode, setExecutionMode } = useExecutionMode('simulation');
  const [activeNavTab, setActiveNavTab] = useState<NavTabId>('dashboard');
  const [stageView, setStageView] = useState<StageViewMode>('agent');

  return (
    <main className="h-screen w-screen bg-theme-bg-base flex overflow-hidden">
      {/* Left Monogram & Icon Navigation Rail */}
      <NavDock activeTab={activeNavTab} onSelectTab={setActiveNavTab} />

      {/* Main Dashboard Stage Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Architectural Controls Bar */}
        <TopNavBar
          executionMode={executionMode}
          onModeChange={setExecutionMode}
        />

        {/* Dynamic Multi-Column Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-spacing-md lg:gap-spacing-lg p-spacing-sm sm:p-spacing-md lg:p-spacing-lg min-h-0 overflow-y-auto lg:overflow-hidden">
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
      </div>
    </main>
  );
}
