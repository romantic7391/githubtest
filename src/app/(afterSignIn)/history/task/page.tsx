import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { Code, Group, Stack, Title } from '@mantine/core';
import { Metadata } from 'next';
import { selectHistoryDtoSchema } from '@/types/history';

export const metadata: Metadata = {
  title: '작업 이력 목록',
};

export default async function Page(params: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await params.searchParams;
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || DEFAULT_PAGE_SIZE;
  const { success, data: filters, error } = selectHistoryDtoSchema.shape.filters.safeParse(searchParams);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>작업 이력 목록</Title>
      </Group>
      <Code block>
        {JSON.stringify(
          {
            success,
            filters,
            error,
          },
          null,
          2,
        )}
      </Code>
      <Code block>
        {JSON.stringify(
          {
            page,
            pageSize,
          },
          null,
          2,
        )}
      </Code>
    </Stack>
  );
}
