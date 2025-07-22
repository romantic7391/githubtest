import styles from './_styles/ManagerCard.module.css';
import { Manager } from '@/types/manager';
import { Anchor, Card, Group, Text, Badge, Stack } from '@mantine/core';
import { useParams } from 'next/navigation';
import useIsMobile from '@/app/_hooks/useIsMobile';
import { useSession } from 'next-auth/react';

type ManagerCardProps = Pick<
  Manager,
  'managerNo' | 'name' | 'signInId' | 'approvedStatus' | 'locked' | 'created' | 'updated'
>;

export default function ManagerCard({
  managerNo,
  name,
  signInId,
  approvedStatus,
  locked,
  created,
  updated,
}: ManagerCardProps) {
  const { area, schoolNo } = useParams();
  const isMobile = useIsMobile();
  const session = useSession();
  const isMyself = session.data?.user.managerNo === managerNo;

  function getStatusBadge() {
    if (locked === 'Y') {
      return (
        <Badge size="md" color="red" variant="light">
          잠금
        </Badge>
      );
    }
    if (approvedStatus === 'APPROVED') {
      return (
        <Badge size="md" color="green" variant="light">
          승인됨
        </Badge>
      );
    }
    if (approvedStatus === 'PENDING') {
      return (
        <Badge size="md" color="orange" variant="light">
          승인 대기중
        </Badge>
      );
    }
    return (
      <Badge size="md" color="gray" variant="light">
        승인 거부됨
      </Badge>
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  function getMyselfBadge() {
    if (isMyself) {
      return (
        <Badge size="md" color="red" variant="light">
          본인
        </Badge>
      );
    }
    return null;
  }

  return (
    <Anchor key={managerNo} href={`/areas/${area}/schools/${schoolNo}/managers/${managerNo}`} underline="never">
      <Card className={styles.card} withBorder p="md">
        {isMobile ? (
          <Stack gap="xs">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                {getMyselfBadge()}
                <Text fw={600} size="lg" c="dark.8">
                  {name}
                </Text>
                <Text size="sm" c="dimmed">
                  {signInId}
                </Text>
              </Stack>
              {getStatusBadge()}
            </Group>

            <Group gap="xs" c="dimmed">
              <Text size="xs">생성: {formatDate(created)}</Text>
              <Text size="xs">수정: {formatDate(updated)}</Text>
            </Group>
          </Stack>
        ) : (
          <Group justify="space-between" align="center">
            <Group gap="lg">
              {getMyselfBadge()}
              <Text fw={600} size="md" c="dark.8">
                {name}
              </Text>
              <Text size="sm" c="dimmed">
                {signInId}
              </Text>
              <Group gap="xs" c="dimmed">
                <Text size="xs">생성: {formatDate(created)}</Text>
                <Text size="xs">수정: {formatDate(updated)}</Text>
              </Group>
            </Group>
            {getStatusBadge()}
          </Group>
        )}
      </Card>
    </Anchor>
  );
}
