import { Stack } from '@mantine/core';
import { Metadata } from 'next';
import SignInHistoryList from './_components/SignInHistoryList';
import SignInHistorySearch from './_components/SignInHistorySearch';
import { signInHistoryFilterSchema } from '@/types/manager-signin-history';
import { paginationSchema } from '@/types/common';
import BreadcrumbNavigation from '../../_components/BreadcrumbNavigation';

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
      <BreadcrumbNavigation title="로그인 이력 목록" showBackButton={false} />
      <SignInHistorySearch />
      <SignInHistoryList page={pagination.page} pageSize={pagination.pageSize} filters={filters} />
    </Stack>
  );
}
