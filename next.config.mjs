import path from 'node:path';

/**
 * Sentry Integration (Phase 3: Task 3.4)
 *
 * To enable Sentry error monitoring:
 * 1. Install: npm install @sentry/nextjs
 * 2. Run wizard: npx @sentry/wizard@latest -i nextjs
 * 3. Set environment variables in .env.local (see .env.local.template)
 * 4. Uncomment the lines below:
 *
 * import { withSentryConfig } from '@sentry/nextjs';
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  webpack: (config, { isServer }) => {
    // Allow @/* imports → src/*
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');
    config.parallelism = 4;

    // Externalize server-only packages from client bundles
    if (!isServer) {
      config.externals = {
        ...config.externals,
        'googleapis': 'googleapis',
        'tesseract.js': 'tesseract.js',
        'pdf-parse': 'pdf-parse',
      };
    }

    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

/**
 * Export with Sentry wrapper (uncomment when @sentry/nextjs is installed)
 *
 * export default withSentryConfig(nextConfig, {
 *   // Sentry webpack plugin options
 *   silent: true, // Suppresses all logs
 *   org: process.env.SENTRY_ORG,
 *   project: process.env.SENTRY_PROJECT,
 *   authToken: process.env.SENTRY_AUTH_TOKEN,
 *
 *   // Upload source maps for better error tracking
 *   widenClientFileUpload: true,
 *   tunnelRoute: '/monitoring',
 *   hideSourceMaps: true,
 *   disableLogger: true,
 * });
 */

export default nextConfig;
