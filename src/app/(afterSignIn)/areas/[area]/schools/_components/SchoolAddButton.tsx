'use client';

import { Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';

export default function SchoolAddButton() {
  const router = useRouter();
  const params = useParams();
  const area = params.area as string;

  return (
    <Button px={10} onClick={() => router.push(`/areas/${area}/schools/create`)}>
      <Group gap={5}>
        <IconPlus size={16} stroke={3} />
        학교 추가
      </Group>
    </Button>
  );
}
