import { Stack } from '@mantine/core';

export default function GroupList({ area, schoolNo }: { area: string; schoolNo: number }) {
  return <Stack>{JSON.stringify({ area, schoolNo }, null, 2)}</Stack>;
}
