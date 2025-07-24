import { Anchor, Breadcrumbs, Stack, Title } from '@mantine/core';
import React from 'react';
import { Metadata } from 'next';
import PermissionCreateForm from './_components/PermissionCreateForm';

export const metadata: Metadata = {
  title: '권한 추가',
};

export default async function Page() {
  return (
    <Stack>
      <Stack>
        <Breadcrumbs>
          <Anchor size="sm" href={`/permissions`}>
            권한 목록
          </Anchor>
          <Anchor size="sm" href={`/permissions/create`}>
            권한 추가
          </Anchor>
        </Breadcrumbs>
        <Title order={3}>권한 추가</Title>
      </Stack>
      <PermissionCreateForm />
    </Stack>
  );
}
