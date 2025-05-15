'use client';

import { AppShell, Group, Anchor, Image, Title, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TestLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 't') {
        router.replace('/');
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
      }}
      padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Anchor href="/" c="dark" underline="never">
            <Group h="100%">
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
              <Image src="/logo.svg" alt="(주)사랑넷 로고" w={57} />
              <Title order={3}>공기질 관리자 테스트 페이지</Title>
            </Group>
          </Anchor>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm"></AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
