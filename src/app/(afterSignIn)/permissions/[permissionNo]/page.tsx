import { Stack } from '@mantine/core';
import PermissionForm from './_components/PermissionForm';
import { Metadata } from 'next';
import BreadcrumbNavigation from '@/app/(afterSignIn)/_components/BreadcrumbNavigation';

export const metadata: Metadata = {
  title: '권한 정보',
  description: '권한 정보',
};

export default async function Page({
  params,
}: {
  params: Promise<{
    permissionNo: string;
  }>;
}) {
  const { permissionNo } = await params;

  return (
    <Stack>
      <Stack>
        <BreadcrumbNavigation title="권한 정보" backHref="/permissions" />
        <PermissionForm permissionNo={Number(permissionNo)} />
      </Stack>
    </Stack>
  );
}
