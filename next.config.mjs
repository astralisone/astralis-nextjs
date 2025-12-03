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

  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps to reduce build memory
  // Note: swcMinify is default in Next.js 15, no longer needs to be specified

  webpack: (config, { isServer, dev }) => {
    // Allow @/* imports → src/*
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');

    // Enable persistent caching for faster builds
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [import.meta.url],
      },
    };

    // Reduce parallelism in production builds to prevent OOM
    // Use 2 workers max in Docker, 4 locally
    config.parallelism = process.env.DOCKER_BUILD === 'true' ? 2 : 4;

    // Optimize memory usage in production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic', // Smaller bundle IDs
        minimize: true,
        splitChunks: {
          chunks: 'all',
          maxSize: 200000, // 200kb chunks to reduce memory usage
        },
      };
    }

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

  // Skip type checking in Docker builds to prevent OOM (types checked in CI separately)
  typescript: {
    ignoreBuildErrors: process.env.DOCKER_BUILD === 'true',
  },

  // Externalize these packages from the server bundle (Next.js 15+)
  // This prevents bundling issues and reduces build memory usage
  serverExternalPackages: [
    'sharp',
    'pdfjs-dist',
    '@anthropic-ai/sdk',
    'openai',
    'tesseract.js',
    'bullmq',
    'ioredis',
  ],

  experimental: {
    instrumentationHook: true,
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
