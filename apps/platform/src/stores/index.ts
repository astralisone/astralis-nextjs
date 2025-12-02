/**
 * Zustand Stores Export
 *
 * Centralized export for all Zustand stores.
 * Each store manages a specific domain of client-side state.
 */

export { useDashboardStore } from './dashboardStore';
export { useUIStore } from './useUIStore';
export { useFilterStore } from './useFilterStore';
export { useNotificationStore } from './useNotificationStore';

export type { Notification, NotificationType } from './useNotificationStore';
export type {
  PipelineFilters,
  IntakeFilters,
  UserFilters,
  AutomationFilters,
  ActivityLogFilters,
} from './useFilterStore';
