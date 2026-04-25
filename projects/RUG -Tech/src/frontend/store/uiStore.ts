import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UIStore {
  sidebarCollapsed: boolean
  activeCaseId: string | null
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  setActiveCaseId: (id: string | null) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeCaseId: null,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      setActiveCaseId: (id) => set({ activeCaseId: id }),
    }),
    {
      name: 'fundus-ui-store',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
)
