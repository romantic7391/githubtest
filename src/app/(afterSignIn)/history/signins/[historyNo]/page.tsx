import { z } from 'zod';
import SignInHistory from './_components/SignInHistory';
import { Stack, Title } from '@mantine/core';

const signInHistoryNoSchema = z.object({
  historyNo: z.coerce.number({ message: '이력 번호는 숫자여야 합니다.' }),
});

export default async function Page({
  params,
}: {
  params: Promise<{
    historyNo: string;
  }>;
}) {
  const { historyNo } = signInHistoryNoSchema.parse(await params);

  return (
    <Stack>
      <Title order={3}>로그인 이력 상세</Title>
      <SignInHistory historyNo={historyNo} />
    </Stack>
  );
}
