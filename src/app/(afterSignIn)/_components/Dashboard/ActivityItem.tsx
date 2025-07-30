import { Paper, Group, Text } from '@mantine/core';
import { IconProps } from '@tabler/icons-react';

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  icon: React.ComponentType<IconProps>;
  iconColor: string;
}

export default function ActivityItem({ title, description, time, icon: Icon, iconColor }: ActivityItemProps) {
  return (
    <Paper withBorder p="md">
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Icon size={16} color={iconColor} />
          <Text size="sm" fw={500}>
            {title}
          </Text>
        </Group>
        <Text size="xs" c="dimmed">
          {time}
        </Text>
      </Group>
      <Text size="sm" c="dimmed">
        {description}
      </Text>
    </Paper>
  );
}
