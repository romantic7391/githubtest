import { Group, Stack, Title } from '@mantine/core';
import { Metadata } from 'next';
import SignInHistoryList from './_components/SignInHistoryList';
import SignInHistorySearch from './_components/SignInHistorySearch';
import { signInHistoryFilterSchema } from '@/types/manager-signin-history';
import { paginationSchema } from '@/types/common';

export const metadata: Metadata = {
  title: '로그인 이력 목록',
};

export default async function Page(params: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await params.searchParams;
  const pagination = paginationSchema.parse(searchParams);
  const filters = signInHistoryFilterSchema.parse(searchParams);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>로그인 이력 목록</Title>
      </Group>
      <SignInHistorySearch />
      <SignInHistoryList page={pagination.page} pageSize={pagination.pageSize} filters={filters} />
    </Stack>
  );
}
