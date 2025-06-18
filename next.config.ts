import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/logging
   */
  logging: {
    fetches: {
      fullUrl: false,
    },
    incomingRequests: false,
  },

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

  productionBrowserSourceMaps: false,

  allowedDevOrigins: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://192.168.11.116:3000',
    'https://192.168.11.116:3000',
  ],
};

export default nextConfig;
