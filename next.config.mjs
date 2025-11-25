import path from 'node:path';

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

export default nextConfig;
