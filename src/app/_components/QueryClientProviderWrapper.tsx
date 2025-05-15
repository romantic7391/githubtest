'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();
export default function QueryClientProviderWrapper({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
