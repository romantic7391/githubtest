'use client';

import { Stack, Title } from '@mantine/core';
import { useParams } from 'next/navigation';
import useSchoolQuery from './_hooks/useSchoolQuery';

export default function Page() {
  const { scode } = useParams<{ scode: string }>();
  const { data: school } = useSchoolQuery({ scode });

  return (
    <Stack gap={10}>
      <Title order={3}>{school.sname}</Title>
    </Stack>
  );
}
