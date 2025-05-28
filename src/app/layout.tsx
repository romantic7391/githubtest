import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '@/lib/mantine/theme';
import QueryClientProviderWrapper from './_components/QueryClientProviderWrapper';

export const metadata: Metadata = {
  title: {
    template: '%s :: 공기질 관리자 페이지',
    default: '공기질 관리자 페이지',
  },
  description: '공기질 관리자 페이지',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="ko">
        <body>
          <QueryClientProviderWrapper>
            <MantineProvider theme={theme}>
              <Notifications />
              {children}
            </MantineProvider>
          </QueryClientProviderWrapper>
        </body>
      </html>
    </SessionProvider>
  );
}
