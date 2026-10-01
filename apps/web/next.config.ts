import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.GITHUB_ACTIONS === 'true' ? '/SheHungry' : undefined,
  trailingSlash: true,
  poweredByHeader: false,
  transpilePackages: ['@shehungry/core'],
};

export default nextConfig;
