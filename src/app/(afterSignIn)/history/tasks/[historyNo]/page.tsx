import { historyNoSchema } from '@/types/history';
import TaskHistory from './_components/TaskHistory';
import { Stack } from '@mantine/core';
import BreadcrumbNavigation from '../../../_components/BreadcrumbNavigation';

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
      <BreadcrumbNavigation title="작업 이력 상세" backHref="/history/tasks" />
      <TaskHistory historyNo={historyNo} />
    </Stack>
  );
}
