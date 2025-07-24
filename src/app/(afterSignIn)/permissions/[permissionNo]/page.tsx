import { Anchor, Breadcrumbs, Stack, Title } from '@mantine/core';
import PermissionForm from './_components/PermissionForm';
import { Metadata } from 'next';

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
        <Breadcrumbs>
          <Anchor size="sm" href={`/permissions`}>
            권한 목록
          </Anchor>
          <Anchor size="sm" href={`/permissions/${permissionNo}`}>
            권한 정보
          </Anchor>
        </Breadcrumbs>
        <Title order={3}>권한 정보</Title>
        <PermissionForm permissionNo={Number(permissionNo)} />
      </Stack>
    </Stack>
  );
}
