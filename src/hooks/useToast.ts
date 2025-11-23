import { useCallback } from 'react';
import { useNotificationStore } from '@/stores/useNotificationStore';
import type { NotificationType } from '@/stores/useNotificationStore';

/**
 * Toast Notification Hook
 *
 * Provides a simple API for showing toast notifications.
 * Wraps the notification store for easier consumption.
 *
 * @example
 * ```ts
 * const toast = useToast();
 *
 * // Simple success message
 * toast.success('Pipeline created successfully');
 *
 * // Error with title
 * toast.error('Failed to save changes', 'Save Error');
 *
 * // Custom duration
 * toast.info('Processing...', 'Please wait', 10000);
 *
 * // With action button
 * toast({
 *   type: 'warning',
 *   message: 'Unsaved changes',
 *   action: {
 *     label: 'Save',
 *     onClick: () => handleSave()
 *   }
 * });
 * ```
 */
export function useToast() {
  const store = useNotificationStore();

  // Main toast function
  const toast = useCallback(
    (options: {
      type: NotificationType;
      message: string;
      title?: string;
      duration?: number;
      dismissible?: boolean;
      action?: {
        label: string;
        onClick: () => void;
      };
    }) => {
      return store.addNotification(options);
    },
    [store]
  );

  // Convenience methods
  const success = useCallback(
    (message: string, title?: string, duration?: number) => {
      return store.success(message, title, duration);
    },
    [store]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => {
      return store.error(message, title, duration);
    },
    [store]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => {
      return store.warning(message, title, duration);
    },
    [store]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => {
      return store.info(message, title, duration);
    },
    [store]
  );

  const dismiss = useCallback(
    (id: string) => {
      store.removeNotification(id);
    },
    [store]
  );

  const dismissAll = useCallback(() => {
    store.clearNotifications();
  }, [store]);

  // Return toast function with methods
  return Object.assign(toast, {
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  });
}
