import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
  // UI State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Active Organization
  activeOrgId: string | null;
  setActiveOrgId: (orgId: string) => void;

  // Filters
  activeFilters: {
    status?: string;
    priority?: number;
    assignedTo?: string;
    dateRange?: { start: Date; end: Date };
  };
  updateFilters: (filters: Partial<DashboardState['activeFilters']>) => void;
  clearFilters: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      activeOrgId: null,
      setActiveOrgId: (orgId) => set({ activeOrgId: orgId }),

      activeFilters: {},
      updateFilters: (filters) =>
        set((state) => ({
          activeFilters: { ...state.activeFilters, ...filters },
        })),
      clearFilters: () => set({ activeFilters: {} }),
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeOrgId: state.activeOrgId,
      }),
    }
  )
);
