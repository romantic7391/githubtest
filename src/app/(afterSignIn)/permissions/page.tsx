import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { Stack } from '@mantine/core';
import PermissionSearch from './_components/PermissionSearch';
import PermissionList from './_components/PermissionList';
import PermissionCreateButton from './_components/PermissionCreateButton';
import { Metadata } from 'next';
import BreadcrumbNavigation from '../_components/BreadcrumbNavigation';

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
      <BreadcrumbNavigation title="권한 목록" showBackButton={false} actions={<PermissionCreateButton />} />
      <PermissionSearch />
      <PermissionList name={name} page={page} pageSize={pageSize} />
    </Stack>
  );
}
