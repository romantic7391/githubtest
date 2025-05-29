'use client';

import { HTTPStatusError } from '@/lib/common.error';
import { Button, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  const status = error instanceof HTTPStatusError ? error.status : 500;

  if (status === 404) {
    return (
      <Stack align="center" justify="center" h="100%">
        <Title order={1}>{status}</Title>
        <Text>{error.message}</Text>
        <Button onClick={() => router.back()}>뒤로 가기</Button>
      </Stack>
    );
  }

  return (
    <Stack align="center" justify="center" h="100%">
      <Title order={1}>{status}</Title>
      <Text>{error.message}</Text>
      <Button onClick={reset}>다시 시도</Button>
    </Stack>
  );
}
