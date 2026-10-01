import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  poweredByHeader: false,
  transpilePackages: ['@shehungry/core'],
};

export default nextConfig;
