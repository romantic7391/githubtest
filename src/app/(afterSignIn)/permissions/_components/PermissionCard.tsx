import { Permission } from '@/types/permission/permission';
import { Anchor, Card, Text } from '@mantine/core';
import styles from './_styles/PermissionCard.module.css';

type PermissionCardProps = Pick<Permission, 'permissionNo' | 'name' | 'description'>;

export default function PermissionCard({ permissionNo, name, description }: PermissionCardProps) {
  return (
    <Anchor key={permissionNo} href={`/permissions/${permissionNo}`} underline="never">
      <Card withBorder className={styles.card}>
        <Text>{name}</Text>
        <Text size="sm" c="gray">
          {description}
        </Text>
      </Card>
    </Anchor>
  );
}
