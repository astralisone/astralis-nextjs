import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * Filter State Store
 *
 * Manages filter state for dashboards and list views.
 * Organized by view/context to support multiple filtered views.
 *
 * Where should this state live?
 * - Filters are UI state that should be cleared on logout
 * - Not persisted to localStorage (session-only)
 * - Scoped by view context (pipelines, intake, users, etc.)
 *
 * Cache invalidation strategy:
 * - Filters trigger new queries via query keys
 * - Clearing filters invalidates related queries
 */

/**
 * Pipeline filter configuration
 */
export interface PipelineFilters {
  search?: string;
  status?: 'active' | 'archived' | 'all';
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Intake request filter configuration
 */
export interface IntakeFilters {
  search?: string;
  status?: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  source?: 'FORM' | 'EMAIL' | 'CHAT' | 'API';
  priority?: number;
  assignedPipeline?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/**
 * User filter configuration
 */
export interface UserFilters {
  search?: string;
  role?: 'ADMIN' | 'OPERATOR' | 'CLIENT' | 'USER';
  isActive?: boolean;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Automation filter configuration
 */
export interface AutomationFilters {
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'runCount' | 'lastRunAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Activity log filter configuration
 */
export interface ActivityLogFilters {
  search?: string;
  action?: string;
  entity?: string;
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface FilterState {
  // Pipeline filters
  pipelineFilters: PipelineFilters;

  // Intake filters
  intakeFilters: IntakeFilters;

  // User filters
  userFilters: UserFilters;

  // Automation filters
  automationFilters: AutomationFilters;

  // Activity log filters
  activityLogFilters: ActivityLogFilters;

  // Pagination
  pagination: {
    pipelines: { page: number; limit: number };
    intake: { page: number; limit: number };
    users: { page: number; limit: number };
    automations: { page: number; limit: number };
    activityLogs: { page: number; limit: number };
  };
}

interface FilterActions {
  // Pipeline filter actions
  setPipelineFilters: (filters: Partial<PipelineFilters>) => void;
  clearPipelineFilters: () => void;

  // Intake filter actions
  setIntakeFilters: (filters: Partial<IntakeFilters>) => void;
  clearIntakeFilters: () => void;

  // User filter actions
  setUserFilters: (filters: Partial<UserFilters>) => void;
  clearUserFilters: () => void;

  // Automation filter actions
  setAutomationFilters: (filters: Partial<AutomationFilters>) => void;
  clearAutomationFilters: () => void;

  // Activity log filter actions
  setActivityLogFilters: (filters: Partial<ActivityLogFilters>) => void;
  clearActivityLogFilters: () => void;

  // Pagination actions
  setPipelinePagination: (page: number, limit: number) => void;
  setIntakePagination: (page: number, limit: number) => void;
  setUserPagination: (page: number, limit: number) => void;
  setAutomationPagination: (page: number, limit: number) => void;
  setActivityLogPagination: (page: number, limit: number) => void;

  // Clear all filters
  clearAllFilters: () => void;
}

const initialState: FilterState = {
  pipelineFilters: {
    status: 'all',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  },
  intakeFilters: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  userFilters: {
    isActive: true,
    sortBy: 'name',
    sortOrder: 'asc',
  },
  automationFilters: {
    sortBy: 'name',
    sortOrder: 'asc',
  },
  activityLogFilters: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    pipelines: { page: 1, limit: 20 },
    intake: { page: 1, limit: 20 },
    users: { page: 1, limit: 20 },
    automations: { page: 1, limit: 20 },
    activityLogs: { page: 1, limit: 50 },
  },
};

export const useFilterStore = create<FilterState & FilterActions>()(
  devtools(
    immer((set) => ({
      ...initialState,

      // Pipeline filters
      setPipelineFilters: (filters) =>
        set((state) => {
          state.pipelineFilters = { ...state.pipelineFilters, ...filters };
        }),
      clearPipelineFilters: () =>
        set((state) => {
          state.pipelineFilters = initialState.pipelineFilters;
        }),

      // Intake filters
      setIntakeFilters: (filters) =>
        set((state) => {
          state.intakeFilters = { ...state.intakeFilters, ...filters };
        }),
      clearIntakeFilters: () =>
        set((state) => {
          state.intakeFilters = initialState.intakeFilters;
        }),

      // User filters
      setUserFilters: (filters) =>
        set((state) => {
          state.userFilters = { ...state.userFilters, ...filters };
        }),
      clearUserFilters: () =>
        set((state) => {
          state.userFilters = initialState.userFilters;
        }),

      // Automation filters
      setAutomationFilters: (filters) =>
        set((state) => {
          state.automationFilters = { ...state.automationFilters, ...filters };
        }),
      clearAutomationFilters: () =>
        set((state) => {
          state.automationFilters = initialState.automationFilters;
        }),

      // Activity log filters
      setActivityLogFilters: (filters) =>
        set((state) => {
          state.activityLogFilters = { ...state.activityLogFilters, ...filters };
        }),
      clearActivityLogFilters: () =>
        set((state) => {
          state.activityLogFilters = initialState.activityLogFilters;
        }),

      // Pagination
      setPipelinePagination: (page, limit) =>
        set((state) => {
          state.pagination.pipelines = { page, limit };
        }),
      setIntakePagination: (page, limit) =>
        set((state) => {
          state.pagination.intake = { page, limit };
        }),
      setUserPagination: (page, limit) =>
        set((state) => {
          state.pagination.users = { page, limit };
        }),
      setAutomationPagination: (page, limit) =>
        set((state) => {
          state.pagination.automations = { page, limit };
        }),
      setActivityLogPagination: (page, limit) =>
        set((state) => {
          state.pagination.activityLogs = { page, limit };
        }),

      // Clear all
      clearAllFilters: () => set(initialState),
    })),
    { name: 'FilterStore' }
  )
);
