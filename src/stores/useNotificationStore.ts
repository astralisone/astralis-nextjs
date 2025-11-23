import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * Notification Store
 *
 * Manages toast notifications queue and display state.
 *
 * State colocation principle:
 * - Notifications are ephemeral UI state
 * - Short-lived (auto-dismiss after timeout)
 * - Global scope (can be triggered from anywhere)
 *
 * Design patterns:
 * - Queue-based: FIFO with max limit
 * - Auto-dismiss: Configurable timeout per notification
 * - Priority levels: Info, success, warning, error
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // milliseconds, 0 = no auto-dismiss
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

interface NotificationState {
  notifications: Notification[];
  maxNotifications: number;
  defaultDuration: number;
}

interface NotificationActions {
  // Add notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;

  // Remove notifications
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Update notification
  updateNotification: (id: string, updates: Partial<Notification>) => void;

  // Configuration
  setMaxNotifications: (max: number) => void;
  setDefaultDuration: (duration: number) => void;
}

/**
 * Generate unique notification ID
 */
function generateId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

const initialState: NotificationState = {
  notifications: [],
  maxNotifications: 5,
  defaultDuration: 5000, // 5 seconds
};

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      addNotification: (notification) => {
        const id = generateId();
        const { defaultDuration, maxNotifications } = get();

        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id,
            createdAt: Date.now(),
            duration: notification.duration ?? defaultDuration,
            dismissible: notification.dismissible ?? true,
          };

          // Add to beginning of queue
          state.notifications.unshift(newNotification);

          // Enforce max notifications limit
          if (state.notifications.length > maxNotifications) {
            state.notifications = state.notifications.slice(0, maxNotifications);
          }
        });

        // Auto-dismiss if duration > 0
        const duration = notification.duration ?? defaultDuration;
        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, duration);
        }

        return id;
      },

      success: (message, title, duration) => {
        return get().addNotification({
          type: 'success',
          title: title || 'Success',
          message,
          duration,
        });
      },

      error: (message, title, duration) => {
        return get().addNotification({
          type: 'error',
          title: title || 'Error',
          message,
          duration: duration || 7000, // Errors stay longer by default
        });
      },

      warning: (message, title, duration) => {
        return get().addNotification({
          type: 'warning',
          title: title || 'Warning',
          message,
          duration,
        });
      },

      info: (message, title, duration) => {
        return get().addNotification({
          type: 'info',
          title,
          message,
          duration,
        });
      },

      removeNotification: (id) =>
        set((state) => {
          state.notifications = state.notifications.filter((n) => n.id !== id);
        }),

      clearNotifications: () =>
        set((state) => {
          state.notifications = [];
        }),

      updateNotification: (id, updates) =>
        set((state) => {
          const index = state.notifications.findIndex((n) => n.id === id);
          if (index !== -1) {
            state.notifications[index] = {
              ...state.notifications[index],
              ...updates,
            };
          }
        }),

      setMaxNotifications: (max) =>
        set((state) => {
          state.maxNotifications = max;
        }),

      setDefaultDuration: (duration) =>
        set((state) => {
          state.defaultDuration = duration;
        }),
    })),
    { name: 'NotificationStore' }
  )
);
