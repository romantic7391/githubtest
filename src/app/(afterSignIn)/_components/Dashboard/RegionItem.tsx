import { Group, Text, Progress } from '@mantine/core';
import { IconProps } from '@tabler/icons-react';

interface RegionItemProps {
  region: string;
  count: number;
  percentage: number;
  icon: React.ComponentType<IconProps>;
  iconColor: string;
}

export default function RegionItem({ region, count, percentage, icon: Icon, iconColor }: RegionItemProps) {
  return (
    <Group justify="space-between">
      <Group gap="xs">
        <Icon size={16} color={iconColor} />
        <Text size="sm">{region}</Text>
      </Group>
      <Group gap="xs">
        <Text size="sm" fw={500}>
          {count}개
        </Text>
        <Progress value={percentage} size="sm" w={60} />
      </Group>
    </Group>
  );
}
