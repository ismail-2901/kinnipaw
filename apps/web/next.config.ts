import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@kinnipaw/api-client',
    '@kinnipaw/config',
    '@kinnipaw/contracts',
    '@kinnipaw/design-tokens',
    '@kinnipaw/domain',
    '@kinnipaw/utils',
  ],
};

export default nextConfig;
