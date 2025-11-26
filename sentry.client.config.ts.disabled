/**
 * Sentry Client Configuration
 *
 * This file configures Sentry for client-side (browser) error tracking.
 * It runs in the user's browser and captures client-side errors, performance data,
 * and session replays.
 *
 * Installation:
 * npm install @sentry/nextjs
 * npx @sentry/wizard@latest -i nextjs
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Data Source Name - unique identifier for your Sentry project
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  // Adjust this value in production to control sampling rate
  // 0.1 = 10% of transactions, 1.0 = 100% of transactions
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay - records user sessions for debugging
  // Sample 10% of normal sessions
  replaysSessionSampleRate: 0.1,
  // Sample 100% of sessions with errors
  replaysOnErrorSampleRate: 1.0,

  // Environment tracking
  environment: process.env.NODE_ENV,

  // Release tracking - helps correlate errors with specific deployments
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Only send errors in production unless explicitly debugging
  enabled:
    process.env.NODE_ENV === 'production' ||
    process.env.SENTRY_DEBUG === 'true',

  // Filter out common noise and non-critical errors
  ignoreErrors: [
    // Browser extensions and third-party scripts
    'top.GLOBALS',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'atomicFindClose',
    // React DevTools
    '__REACT_DEVTOOLS_GLOBAL_HOOK__',
    // ResizeObserver errors (benign)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Non-Error promise rejections (often handled)
    'Non-Error promise rejection captured',
    // Chunk loading failures (handled by Next.js)
    /Loading chunk \d+ failed/,
    /ChunkLoadError/,
    // Network errors (handled by retry logic)
    /NetworkError/,
    /Failed to fetch/,
  ],

  // Customize error fingerprinting for better grouping
  beforeSend(event, hint) {
    // Filter out errors from browser extensions
    if (event.exception?.values?.[0]?.stacktrace?.frames) {
      const frames = event.exception.values[0].stacktrace.frames;
      if (
        frames.some(
          (frame) =>
            frame.filename?.includes('extensions/') ||
            frame.filename?.includes('chrome-extension://')
        )
      ) {
        return null;
      }
    }

    return event;
  },

  // Add custom tags for filtering
  initialScope: {
    tags: {
      runtime: 'browser',
    },
  },
});
