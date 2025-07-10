'use client';

import { Code, Grid, Stack, Title } from '@mantine/core';
import useFilteredGroups from '../_hooks/useFilteredGroups';
import GroupAddButton from './GroupCreateButton';

export default function GroupList({ area, schoolNo }: { area: string; schoolNo: number }) {
  const { data } = useFilteredGroups({
    area,
    schoolNo,
  });

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 2 }}>
        <Stack>
          <Title order={4}>그룹 목록</Title>
          <Code block>{JSON.stringify(data, null, 2)}</Code>
          <GroupAddButton />
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 9 }}>그룹 정보</Grid.Col>
    </Grid>
  );
}
