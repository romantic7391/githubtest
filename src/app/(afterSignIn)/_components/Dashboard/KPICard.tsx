import { Card, Group, Text, Badge } from '@mantine/core';
import { IconProps } from '@tabler/icons-react';

interface KPICardProps {
  title: string;
  value: string | number;
  badge: {
    text: string;
    color: string;
  };
  icon: React.ComponentType<IconProps>;
  iconColor: string;
}

export default function KPICard({ title, value, badge, icon: Icon, iconColor }: KPICardProps) {
  return (
    <Card withBorder padding="md" radius="md">
      <Group justify="space-between" mb="xs">
        <Text size="xs" c="dimmed" fw={500} tt="uppercase">
          {title}
        </Text>
        <Icon size={18} color={iconColor} />
      </Group>
      <Group align="flex-end" gap="xs">
        <Text size="lg" fw={700}>
          {value}
        </Text>
        <Badge color={badge.color} variant="light" size="sm">
          {badge.text}
        </Badge>
      </Group>
    </Card>
  );
}
