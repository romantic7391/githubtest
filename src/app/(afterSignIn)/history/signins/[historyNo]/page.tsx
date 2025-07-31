import { z } from 'zod';
import SignInHistory from './_components/SignInHistory';
import { Stack } from '@mantine/core';
import BreadcrumbNavigation from '../../../_components/BreadcrumbNavigation';

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
      <BreadcrumbNavigation title="로그인 이력 상세" backHref="/history/signins" />
      <SignInHistory historyNo={historyNo} />
    </Stack>
  );
}
