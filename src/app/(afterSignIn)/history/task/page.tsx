import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { Code, Group, Stack, Title } from '@mantine/core';
import { Metadata } from 'next';
import { selectHistoryDtoSchema } from '@/types/history';
import Search from '../../_components/Search';

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
      <Search
        searchKeys={[
          { label: '지역', value: 'area' },
          { label: '학교 이름', value: 'sname' },
          { label: '그룹 이름', value: 'gname' },
          { label: '사용자 이름', value: 'mname' },
          { label: '아이디', value: 'mid' },
          { label: 'IP 주소', value: 'ip' },
          { label: 'User Agent', value: 'userAgent' },
          { label: '이력 번호', value: 'historyNo' },
        ]}
      />
    </Stack>
  );
}
