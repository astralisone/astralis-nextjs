/**
 * Sentry Server Configuration
 *
 * This file configures Sentry for server-side (Node.js) error tracking.
 * It runs on the server and captures API errors, server-side rendering errors,
 * and background job failures.
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
  // Use server-side env variable (not NEXT_PUBLIC_)
  dsn: process.env.SENTRY_DSN,

  // Performance Monitoring
  // Lower sample rate in production to reduce overhead
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment tracking
  environment: process.env.NODE_ENV,

  // Release tracking - helps correlate errors with specific deployments
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Only send errors in production unless explicitly debugging
  enabled:
    process.env.NODE_ENV === 'production' ||
    process.env.SENTRY_DEBUG === 'true',

  // Server-specific options
  autoSessionTracking: true,

  // Add custom tags for filtering
  initialScope: {
    tags: {
      runtime: 'node',
    },
  },

  // Customize error handling
  beforeSend(event, hint) {
    // Don't send errors from health check endpoints
    if (event.request?.url?.includes('/api/health')) {
      return null;
    }

    // Add server context
    if (event.contexts) {
      event.contexts.server = {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
      };
    }

    return event;
  },

  // Configure integrations
  integrations: [
    // Capture console errors
    new Sentry.Integrations.Console({
      levels: ['error'],
    }),
    // Capture unhandled promise rejections
    new Sentry.Integrations.OnUncaughtException({
      exitEvenIfOtherHandlersAreRegistered: false,
    }),
    new Sentry.Integrations.OnUnhandledRejection({
      mode: 'warn',
    }),
  ],
});
