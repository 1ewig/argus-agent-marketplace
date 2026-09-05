import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExecutionMode, StageViewMode } from '@/lib/types';
import type { ChatMessageRecord } from '@/lib/db';
import { DEFAULT_CONVERSATION_ID } from '@/lib/db';

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

  // Sidebar Collapsed State (Persisted in localStorage)
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Hydration state tracking
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
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

      // Sidebar Collapsed State
      isSidebarCollapsed: false,
      setIsSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

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
      }),
    }
  )
);
