'use client';

import { Anchor, AppShell, Burger, Group, Image, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import LeftNavigation from './_components/LeftNavigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AfterLoginLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 't') {
        router.push('/test');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 200,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Anchor href="/" c="dark" underline="never">
            <Group h="100%">
              <Image src="/logo.svg" alt="(주)사랑넷 로고" w={57} />
              <Title order={3}>공기질 관리자페이지</Title>
            </Group>
          </Anchor>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <LeftNavigation />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
