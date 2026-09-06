import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExecutionMode, StageViewMode, RightPanelTab } from '@/lib/types';
import type { ChatMessageRecord } from '@/lib/db';
import { DEFAULT_CONVERSATION_ID } from '@/lib/db';
import { isGlobalSymbol } from '@/lib/utils';

export interface AppState {
  // Execution Mode ('simulation')
  executionMode: ExecutionMode;
  setExecutionMode: (mode: ExecutionMode) => void;

  // Stage View (Agent vs Chart)
  stageView: StageViewMode;
  setStageView: (view: StageViewMode) => void;

  // Active Chat Session State
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  activeStreamMessage: ChatMessageRecord | null;
  setActiveStreamMessage: (
    messageOrUpdater:
      | ChatMessageRecord
      | null
      | ((prev: ChatMessageRecord | null) => ChatMessageRecord | null)
  ) => void;
  errorNotice: string | null;
  setErrorNotice: (error: string | null) => void;

  // Selected Workspace Symbol (e.g. BTCUSDT, SOLUSDT, or GLOBAL)
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  lastActiveSymbol: string;
  setLastActiveSymbol: (symbol: string) => void;

  // Symbol Search Modal State
  isSymbolSearchOpen: boolean;
  setIsSymbolSearchOpen: (open: boolean) => void;
  toggleSymbolSearch: () => void;

  // Sidebar Collapsed State (Persisted in localStorage)
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Workspace Groups Collapsed State (Persisted in localStorage)
  collapsedWorkspaceGroups: Record<string, boolean>;
  setWorkspaceGroupCollapsed: (symbol: string, collapsed: boolean) => void;
  toggleWorkspaceGroupCollapsed: (symbol: string) => void;

  // Right Market Overview Panel State (Persisted in localStorage)
  isMarketPanelOpen: boolean;
  setIsMarketPanelOpen: (open: boolean) => void;
  toggleMarketPanel: () => void;

  // Right Panel Active Tab
  rightPanelTab: RightPanelTab;
  setRightPanelTab: (tab: RightPanelTab) => void;

  // Hydration state tracking
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

/**
 * Predicate checking whether the right panel is currently displaying Market Intelligence
 */
export function isIntelligenceTabActive(tab: AppState['rightPanelTab']): boolean {
  return tab === 'intelligence' || tab === 'market-data';
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Execution Mode defaults to 'simulation'
      executionMode: 'simulation',
      setExecutionMode: (mode) => set({ executionMode: mode }),

      // Stage View defaults to 'agent'
      stageView: 'agent',
      setStageView: (view) => set({ stageView: view }),

      // Chat State
      activeConversationId: DEFAULT_CONVERSATION_ID,
      setActiveConversationId: (id) => set({ activeConversationId: id }),
      input: '',
      setInput: (input) => set({ input }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      activeStreamMessage: null,
      setActiveStreamMessage: (messageOrUpdater) =>
        set((state) => ({
          activeStreamMessage:
            typeof messageOrUpdater === 'function'
              ? messageOrUpdater(state.activeStreamMessage)
              : messageOrUpdater,
        })),
      errorNotice: null,
      setErrorNotice: (errorNotice) => set({ errorNotice }),

      // Selected Workspace Symbol
      selectedSymbol: 'BTCUSDT',
      setSelectedSymbol: (selectedSymbol) =>
        set((state) => {
          if (state.selectedSymbol === selectedSymbol) return state;
          const isGlobal = isGlobalSymbol(selectedSymbol);
          return {
            selectedSymbol,
            lastActiveSymbol: !isGlobal ? selectedSymbol : state.lastActiveSymbol,
          };
        }),
      lastActiveSymbol: 'BTCUSDT',
      setLastActiveSymbol: (lastActiveSymbol) => set({ lastActiveSymbol }),

      // Symbol Search Modal State
      isSymbolSearchOpen: false,
      setIsSymbolSearchOpen: (isSymbolSearchOpen) => set({ isSymbolSearchOpen }),
      toggleSymbolSearch: () => set((state) => ({ isSymbolSearchOpen: !state.isSymbolSearchOpen })),

      // Sidebar Collapsed State
      isSidebarCollapsed: false,
      setIsSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      // Workspace Groups Collapsed State
      collapsedWorkspaceGroups: {},
      setWorkspaceGroupCollapsed: (symbol, collapsed) =>
        set((state) => ({
          collapsedWorkspaceGroups: {
            ...state.collapsedWorkspaceGroups,
            [symbol.toUpperCase()]: collapsed,
          },
        })),
      toggleWorkspaceGroupCollapsed: (symbol) =>
        set((state) => {
          const upper = symbol.toUpperCase();
          const currentCollapsed = Boolean(state.collapsedWorkspaceGroups[upper]);
          return {
            collapsedWorkspaceGroups: {
              ...state.collapsedWorkspaceGroups,
              [upper]: !currentCollapsed,
            },
          };
        }),

      // Right Market Overview Panel State (defaults to open)
      isMarketPanelOpen: true,
      setIsMarketPanelOpen: (isMarketPanelOpen) => set({ isMarketPanelOpen }),
      toggleMarketPanel: () =>
        set((state) => ({ isMarketPanelOpen: !state.isMarketPanelOpen })),

      // Right Panel Active Tab (defaults to overview)
      rightPanelTab: 'overview',
      setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),

      // Hydration state
      _hasHydrated: false,
      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),
    }),
    {
      name: 'argus-session-store',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        activeConversationId: state.activeConversationId,
        stageView: state.stageView,
        isSidebarCollapsed: state.isSidebarCollapsed,
        isMarketPanelOpen: state.isMarketPanelOpen,
        rightPanelTab: state.rightPanelTab,
        selectedSymbol: state.selectedSymbol,
        lastActiveSymbol: state.lastActiveSymbol,
        collapsedWorkspaceGroups: state.collapsedWorkspaceGroups,
      }),
    }
  )
);
