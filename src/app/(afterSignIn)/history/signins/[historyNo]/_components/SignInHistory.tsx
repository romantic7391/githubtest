'use client';

import { Stack, Card, Title, Text, Group, Badge, Divider, Alert, Loader, Grid, Button } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import useSignInHistory from '../../_hooks/useSignInHistory';
import dayjs from '@/lib/dayjs';

export default function SignInHistory({ historyNo }: { historyNo: number }) {
  const { data, fetchStatus, isSuccess, error, isError } = useSignInHistory(historyNo);
  const router = useRouter();

  function getSuccessString(success: string) {
    switch (success) {
      case 'Y':
        return '성공';
      case 'N':
        return '실패';
      default:
        return success;
    }
  }

  function getSuccessColor(success: string) {
    switch (success) {
      case 'Y':
        return 'green';
      case 'N':
        return 'red';
      default:
        return 'gray';
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return '-';
    try {
      return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
    } catch {
      return dateString;
    }
  }

  function formatText(text: string | null) {
    if (!text) return '-';
    return text;
  }

  function handleGoBack() {
    router.back();
  }

  // 로딩 상태
  if (fetchStatus === 'fetching') {
    return (
      <Stack align="center" py="xl">
        <Loader size="lg" />
        <Text size="sm" c="dimmed">
          데이터를 불러오고 있습니다...
        </Text>
      </Stack>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <Stack>
        <Button leftSection={<IconArrowLeft size="1rem" />} variant="subtle" onClick={handleGoBack} w="fit-content">
          목록으로 돌아가기
        </Button>
        <Alert icon={<IconAlertCircle size="1rem" />} title="오류가 발생했습니다" color="red">
          <Text size="sm">{error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.'}</Text>
        </Alert>
      </Stack>
    );
  }

  // 데이터가 없는 경우
  if (isSuccess && fetchStatus === 'idle' && !data) {
    return (
      <Stack>
        <Button leftSection={<IconArrowLeft size="1rem" />} variant="subtle" onClick={handleGoBack} w="fit-content">
          목록으로 돌아가기
        </Button>
        <Card withBorder>
          <Stack align="center" py="xl">
            <IconInfoCircle size="3rem" color="var(--mantine-color-gray-4)" />
            <Title order={5}>이력을 찾을 수 없습니다</Title>
            <Text size="sm" c="dimmed" ta="center">
              요청하신 이력 번호 {historyNo}에 해당하는 데이터가 존재하지 않습니다.
            </Text>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Stack>
      <Button leftSection={<IconArrowLeft size="1rem" />} variant="subtle" onClick={handleGoBack} w="fit-content">
        목록으로 돌아가기
      </Button>

      <Card withBorder>
        <Stack>
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                이력 번호: {data.historyNo}
              </Text>
            </Stack>
            <Badge color={getSuccessColor(data.success)} variant="light" size="lg">
              {getSuccessString(data.success)}
            </Badge>
          </Group>

          <Divider />

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <Title order={5}>로그인 정보</Title>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    로그인 시각
                  </Text>
                  <Text size="sm">{formatDate(data.signInTime)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    로그아웃 시각
                  </Text>
                  <Text size="sm">{formatDate(data.signOutTime)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    IP 주소
                  </Text>
                  <Text size="sm">{formatText(data.ip)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    로그인 ID
                  </Text>
                  <Text size="sm">{formatText(data.signInId)}</Text>
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <Title order={5}>사용자 정보</Title>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    사용자명
                  </Text>
                  <Text size="sm">{formatText(data.managerName)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    사용자 번호
                  </Text>
                  <Text size="sm">{data.managerNo}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    학교명
                  </Text>
                  <Text size="sm">{formatText(data.schoolName)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    학교 코드
                  </Text>
                  <Text size="sm">{formatText(data.schoolCode)}</Text>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>
    </Stack>
  );
}
