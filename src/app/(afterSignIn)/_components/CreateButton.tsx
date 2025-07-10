import { Button, Group } from '@mantine/core';
import { Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export default function CreateButton({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <Button px={10} onClick={onClick}>
      <Group gap={5}>
        <IconPlus size={16} stroke={3} />
        <Text>{name}&nbsp;추가</Text>
      </Group>
    </Button>
  );
}
