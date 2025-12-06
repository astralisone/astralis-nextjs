/**
 * Date formatting utilities
 *
 * Uses native Intl.DateTimeFormat API for Vercel Edge Runtime compatibility.
 * Replaces date-fns in client components to avoid ESM/CommonJS interop issues.
 */

/**
 * Format date to "MMM d, yyyy" (e.g., "Dec 6, 2025")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format date with time to "MMM d, yyyy h:mm a" (e.g., "Dec 6, 2025 3:45 PM")
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Format date to full format "MMMM d, yyyy" (e.g., "December 6, 2025")
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format time only "h:mm a" (e.g., "3:45 PM")
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}
