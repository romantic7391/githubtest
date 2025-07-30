import { Button, Group } from '@mantine/core';
import { Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export default function CreateButton({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <Button
      px={10}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      aria-label={`${name} 추가`}>
      <Group gap={5}>
        <IconPlus size={16} stroke={3} />
        <Text>{name}&nbsp;추가</Text>
      </Group>
    </Button>
  );
}
