import { Stack } from '@mantine/core';
import React from 'react';
import { Metadata } from 'next';
import PermissionCreateForm from './_components/PermissionCreateForm';
import BreadcrumbNavigation from '../_components/BreadcrumbNavigation';

export const metadata: Metadata = {
  title: '권한 추가',
};

export default async function Page() {
  return (
    <Stack>
      <Stack>
        <BreadcrumbNavigation title="권한 추가" backHref="/permissions" />
      </Stack>
      <PermissionCreateForm />
    </Stack>
  );
}
