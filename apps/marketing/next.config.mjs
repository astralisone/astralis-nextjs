/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@astralis/ui'],
  trailingSlash: true,
};

export default nextConfig;
