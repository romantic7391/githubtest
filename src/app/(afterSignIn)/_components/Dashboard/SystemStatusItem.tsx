import { Group, Text, Badge } from '@mantine/core';
import { IconProps } from '@tabler/icons-react';

interface SystemStatusItemProps {
  name: string;
  status: string;
  statusColor: string;
  icon: React.ComponentType<IconProps>;
  iconColor: string;
}

export default function SystemStatusItem({ name, status, statusColor, icon: Icon, iconColor }: SystemStatusItemProps) {
  return (
    <Group justify="space-between">
      <Group gap="xs">
        <Icon size={16} color={iconColor} />
        <Text size="sm">{name}</Text>
      </Group>
      <Badge color={statusColor} variant="light" size="sm">
        {status}
      </Badge>
    </Group>
  );
}
