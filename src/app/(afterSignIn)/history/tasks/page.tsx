import { Group, Stack, Title } from '@mantine/core';
import { Metadata } from 'next';
import TaskHistoryList from '../_components/TaskHistoryList';
import TaskHistorySearch from '../_components/TaskHistorySearch';

export const metadata: Metadata = {
  title: '작업 이력 목록',
};

export default async function Page() {
  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>작업 이력 목록</Title>
      </Group>
      <TaskHistorySearch />
      <TaskHistoryList />
    </Stack>
  );
}
