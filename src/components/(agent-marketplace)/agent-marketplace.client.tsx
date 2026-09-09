'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAgentMarketplace } from '@/hooks/agents';
import { useAppStore } from '@/stores/app-store';
import { db } from '@/lib/db';
import { MarketplaceHeader } from './marketplace-header';
import { MarketplaceFilterBar } from './marketplace-filter-bar';
import { AgentGrid } from './agent-grid';
import { AgentDetailModal } from './agent-detail-modal';
import { HireAgentModal } from './hire-agent-modal';
import { HiredAgentsPanel } from './hired-agents-panel';
import type { ScanAgentItem } from '@/lib/8004scan/types';
import type { HiredAgentRecord } from '@/lib/types';

export function AgentMarketplaceClient() {
  const router = useRouter();
  const toggleMobileSidebar = useAppStore((state) => state.toggleMobileSidebar);
  const setInput = useAppStore((state) => state.setInput);

  // Hired Agents Panel state
  const [isHiredPanelOpen, setIsHiredPanelOpen] = useState(true);
  const [agentToHire, setAgentToHire] = useState<ScanAgentItem | null>(null);

  // Live query for active hired count
  const hiredAgents = useLiveQuery(() => db.hiredAgents.toArray(), []);
  const activeHiredCount = (hiredAgents ?? []).filter((a) => a.status === 'active').length;

  const {
    selectedCategory,
    setSelectedCategory,
    selectedSort,
    setSelectedSort,
    selectedTab,
    setSelectedTab,
    searchQuery,
    setSearchQuery,
    clearSearch,
    selectedAgent,
    setSelectedAgent,
    page,
    setPage,
    pageSize,
    totalPages,
    agents,
    totalCount,
    spotlightHevo,
    spotlightAlpha,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useAgentMarketplace();

  // Handle agent inspection
  const handleSelectAgent = useCallback(
    (agent: ScanAgentItem) => {
      setSelectedAgent(agent);
    },
    [setSelectedAgent],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedAgent(null);
  }, [setSelectedAgent]);

  // Handle hiring initiation
  const handleOpenHireModal = useCallback(
    (agent: ScanAgentItem) => {
      setSelectedAgent(null);
      setAgentToHire(agent);
    },
    [setSelectedAgent],
  );

  const handleHireSuccess = useCallback((_record: HiredAgentRecord) => {
    setIsHiredPanelOpen(true);
  }, []);

  // Handle transfer to chat reasoning desk
  const handleAnalyzeInChat = useCallback(
    (prompt: string) => {
      setSelectedAgent(null);
      setInput(prompt);
      router.push('/');
    },
    [router, setInput, setSelectedAgent],
  );

  const handleResetFilters = useCallback(() => {
    clearSearch();
    setSelectedCategory('all');
    setSelectedSort('leaderboard');
  }, [clearSearch, setSelectedCategory, setSelectedSort]);

  return (
    <div className="relative flex flex-col h-full w-full bg-theme-bg-base overflow-hidden">
      {/* 1. Header Toolbar */}
      <MarketplaceHeader
        onRefresh={refetch}
        onToggleMobileSidebar={toggleMobileSidebar}
        totalCount={totalCount}
        isFetching={isFetching}
        isHiredPanelOpen={isHiredPanelOpen}
        onToggleHiredPanel={() => setIsHiredPanelOpen((prev) => !prev)}
        hiredCount={activeHiredCount}
      />

      {/* 2. Main Area: Scrollable Marketplace + Docked Hired Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto flex flex-col min-w-0">
          {/* Categories & Curated Feeds Filter Tabs */}
          <MarketplaceFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={clearSearch}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedSort={selectedSort}
            onSelectSort={setSelectedSort}
            selectedTab={selectedTab}
            onSelectTab={setSelectedTab}
          />

          {/* Agents Grid & Pagination */}
          <AgentGrid
            agents={agents}
            spotlightAgents={
              !searchQuery && selectedCategory === 'all' && page === 0
                ? [...spotlightHevo.slice(0, 1), ...spotlightAlpha.slice(0, 1)]
                : undefined
            }
            totalCount={totalCount}
            isLoading={isLoading}
            isError={isError}
            onSelectAgent={handleSelectAgent}
            onHireAgent={handleOpenHireModal}
            onRetry={refetch}
            onResetFilters={handleResetFilters}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>

        {/* Hired Agents Docked Side Panel */}
        <HiredAgentsPanel
          isOpen={isHiredPanelOpen}
          onClose={() => setIsHiredPanelOpen(false)}
        />
      </div>

      {/* 3. Detailed Profile Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        onClose={handleCloseModal}
        onAnalyzeInChat={handleAnalyzeInChat}
        onHireAgent={handleOpenHireModal}
      />

      {/* 4. Hire Agent Modal */}
      <HireAgentModal
        agent={agentToHire}
        isOpen={Boolean(agentToHire)}
        onClose={() => setAgentToHire(null)}
        onSuccess={handleHireSuccess}
      />
    </div>
  );
}
