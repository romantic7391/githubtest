import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { Group, Stack, Title } from '@mantine/core';
import Search from '../_components/Search';
import PermissionList from './_components/PermissionList';
import PermissionCreateButton from './_components/PermissionCreateButton';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '권한 목록',
  description: '권한 목록',
};

export default async function Page(params: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await params.searchParams;
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || DEFAULT_PAGE_SIZE;
  const name = searchParams.name as string | null;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>권한 목록</Title>
        <PermissionCreateButton />
      </Group>
      <Search
        searchKeys={[
          {
            label: '권한 이름',
            value: 'name',
          },
        ]}
      />
      <PermissionList name={name} page={page} pageSize={pageSize} />
    </Stack>
  );
}
