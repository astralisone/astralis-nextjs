import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * UI State Store
 *
 * Manages global UI state including:
 * - Sidebar collapse state
 * - Modal visibility
 * - Drawer state
 * - Loading overlays
 * - Active view preferences
 *
 * Uses:
 * - persist: Save UI preferences to localStorage
 * - devtools: Redux DevTools integration
 * - immer: Immutable state updates with mutable syntax
 */

interface Modal {
  id: string;
  isOpen: boolean;
  data?: any;
}

interface Drawer {
  id: string;
  isOpen: boolean;
  data?: any;
}

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarWidth: number;

  // Modals
  modals: Record<string, Modal>;

  // Drawers
  drawers: Record<string, Drawer>;

  // Loading
  globalLoading: boolean;
  loadingMessage?: string;

  // View preferences
  viewMode: 'grid' | 'list' | 'kanban';
  density: 'comfortable' | 'compact' | 'spacious';

  // Theme (for future dark mode support)
  theme: 'light' | 'dark' | 'system';
}

interface UIActions {
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;

  // Modal actions
  openModal: (id: string, data?: any) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
  getModalData: (id: string) => any;

  // Drawer actions
  openDrawer: (id: string, data?: any) => void;
  closeDrawer: (id: string) => void;
  isDrawerOpen: (id: string) => boolean;
  getDrawerData: (id: string) => any;

  // Loading actions
  setGlobalLoading: (loading: boolean, message?: string) => void;

  // View preference actions
  setViewMode: (mode: 'grid' | 'list' | 'kanban') => void;
  setDensity: (density: 'comfortable' | 'compact' | 'spacious') => void;

  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Reset
  resetUI: () => void;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  sidebarWidth: 280,
  modals: {},
  drawers: {},
  globalLoading: false,
  viewMode: 'kanban',
  density: 'comfortable',
  theme: 'light',
};

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Sidebar
        toggleSidebar: () =>
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          }),
        setSidebarCollapsed: (collapsed) =>
          set((state) => {
            state.sidebarCollapsed = collapsed;
          }),
        setSidebarWidth: (width) =>
          set((state) => {
            state.sidebarWidth = width;
          }),

        // Modals
        openModal: (id, data) =>
          set((state) => {
            state.modals[id] = { id, isOpen: true, data };
          }),
        closeModal: (id) =>
          set((state) => {
            if (state.modals[id]) {
              state.modals[id].isOpen = false;
            }
          }),
        isModalOpen: (id) => get().modals[id]?.isOpen ?? false,
        getModalData: (id) => get().modals[id]?.data,

        // Drawers
        openDrawer: (id, data) =>
          set((state) => {
            state.drawers[id] = { id, isOpen: true, data };
          }),
        closeDrawer: (id) =>
          set((state) => {
            if (state.drawers[id]) {
              state.drawers[id].isOpen = false;
            }
          }),
        isDrawerOpen: (id) => get().drawers[id]?.isOpen ?? false,
        getDrawerData: (id) => get().drawers[id]?.data,

        // Loading
        setGlobalLoading: (loading, message) =>
          set((state) => {
            state.globalLoading = loading;
            state.loadingMessage = message;
          }),

        // View preferences
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode;
          }),
        setDensity: (density) =>
          set((state) => {
            state.density = density;
          }),

        // Theme
        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
          }),

        // Reset
        resetUI: () => set(initialState),
      })),
      {
        name: 'astralis-ui-storage',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          sidebarWidth: state.sidebarWidth,
          viewMode: state.viewMode,
          density: state.density,
          theme: state.theme,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);
