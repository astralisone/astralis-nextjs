/**
 * Sentry Edge Runtime Configuration
 *
 * This file configures Sentry for Edge Runtime environments (middleware, edge functions).
 * Edge runtime has limitations compared to Node.js, so this config is minimal.
 *
 * Installation:
 * npm install @sentry/nextjs
 * npx @sentry/wizard@latest -i nextjs
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#edge-runtime
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Data Source Name - unique identifier for your Sentry project
  dsn: process.env.SENTRY_DSN,

  // Performance Monitoring
  // Lower sample rate for edge runtime to minimize overhead
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment tracking
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Only send errors in production unless explicitly debugging
  enabled:
    process.env.NODE_ENV === 'production' ||
    process.env.SENTRY_DEBUG === 'true',

  // Add custom tags for filtering
  initialScope: {
    tags: {
      runtime: 'edge',
    },
  },

  // Edge runtime has limited integrations available
  // Most Node.js integrations are not supported
});
