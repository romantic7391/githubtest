'use client';

import { Stack, Title } from '@mantine/core';
import SchoolList from './_components/SchoolList';

export default function Page() {
  return (
    <Stack gap={10}>
      <Title order={3}>학교 목록</Title>
      <SchoolList />
    </Stack>
  );
}
