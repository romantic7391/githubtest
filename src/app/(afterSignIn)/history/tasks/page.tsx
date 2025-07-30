import { Stack } from '@mantine/core';
import { Metadata } from 'next';
import TaskHistoryList from './_components/TaskHistoryList';
import TaskHistorySearch from './_components/TaskHistorySearch';
import { historyFilterSchema } from '@/types/history';
import { paginationSchema } from '@/types/common';
import BreadcrumbNavigation from '../../_components/BreadcrumbNavigation';

export const metadata: Metadata = {
  title: '작업 이력 목록',
};

export default async function Page(params: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await params.searchParams;
  const pagination = paginationSchema.parse(searchParams);
  const filters = historyFilterSchema.parse(searchParams);

  return (
    <Stack>
      <BreadcrumbNavigation title="작업 이력 목록" showBackButton={false} />
      <TaskHistorySearch />
      <TaskHistoryList page={pagination.page} pageSize={pagination.pageSize} filters={filters} />
    </Stack>
  );
}
