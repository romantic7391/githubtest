import type { Group } from '@/types/permission';
import { Anchor, Card, Group as MantineGroup, Text, Badge, Stack } from '@mantine/core';
import styles from './_styles/GroupCard.module.css';

type GroupCardProps = Pick<Group, 'group_no' | 'name' | 'parent_group_name' | 'school_name' | 'created' | 'updated'>;

export default function GroupCard({
  group_no,
  name,
  parent_group_name,
  school_name,
  created,
  updated,
}: GroupCardProps) {
  return (
    <Anchor className={styles.anchor} key={group_no} href={`/areas/all/groups/${group_no}`} underline="never">
      <Card className={styles.card} withBorder>
        <MantineGroup justify="space-between" align="flex-start">
          <Stack gap="xs">
            <MantineGroup gap={0}>
              <Text fw={500}>{name}</Text>
              <Text size="sm" c="gray">
                &#35;{group_no}
              </Text>
            </MantineGroup>
            {school_name && (
              <Text size="sm" c="dimmed">
                학교: {school_name}
              </Text>
            )}
            {parent_group_name && (
              <Text size="sm" c="dimmed">
                상위 그룹: {parent_group_name}
              </Text>
            )}
            <MantineGroup gap="md">
              {created && (
                <Text size="xs" c="dimmed">
                  생성일: {new Date(created).toLocaleDateString('ko-KR')}
                </Text>
              )}
              {updated && (
                <Text size="xs" c="dimmed">
                  수정일: {new Date(updated).toLocaleDateString('ko-KR')}
                </Text>
              )}
            </MantineGroup>
          </Stack>
          <Badge variant="light" color="blue">
            그룹
          </Badge>
        </MantineGroup>
      </Card>
    </Anchor>
  );
}
