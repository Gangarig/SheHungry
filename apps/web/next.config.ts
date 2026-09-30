import type { NextConfig } from 'next';

// GitHub Pages serves project sites below /<repository>. The deployment
// workflow sets this value; local development deliberately stays at /.
const deploymentPath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/^\/+|\/+$/g, '') ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  poweredByHeader: false,
  basePath: deploymentPath ? `/${deploymentPath}` : '',
  transpilePackages: ['@shehungry/core'],
};

export default nextConfig;
