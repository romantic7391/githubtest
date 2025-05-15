import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/logging
   */
  logging: false,

  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/dates',
      '@mantine/form',
      '@mantine/hooks',
      '@mantine/modals',
      '@mantine/notifications',
      '@mantine/charts',
    ],
  },
};

export default nextConfig;
