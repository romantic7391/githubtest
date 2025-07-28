import { historyNoSchema } from '@/types/history';
import TaskHistory from './_components/TaskHistory';
import { Stack, Title } from '@mantine/core';

export default async function Page({
  params,
}: {
  params: Promise<{
    historyNo: string;
  }>;
}) {
  const { historyNo } = historyNoSchema.parse(await params);

  return (
    <Stack>
      <Title order={3}>작업 이력 상세</Title>
      <TaskHistory historyNo={historyNo} />
    </Stack>
  );
}
