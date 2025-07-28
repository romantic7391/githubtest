'use client';

import { Stack, Card, Title, Text, Group, Badge, Divider, Alert, Loader, Grid, Code, Button } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import useHistory from '../_hooks/useHistory';
import dayjs from '@/lib/dayjs';

export default function TaskHistory({ historyNo }: { historyNo: number }) {
  const { data, fetchStatus, isSuccess, error, isError } = useHistory(historyNo);
  const router = useRouter();

  function getActionTypeString(actionType: string) {
    switch (actionType) {
      case 'I':
        return '추가';
      case 'U':
        return '수정';
      case 'D':
        return '삭제';
      case 'S':
        return '조회';
      default:
        return actionType;
    }
  }

  function getActionTypeColor(actionType: string) {
    switch (actionType) {
      case 'I':
        return 'green';
      case 'U':
        return 'blue';
      case 'D':
        return 'red';
      case 'S':
        return 'gray';
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

  function formatJsonText(text: string | null) {
    if (!text) return '-';
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text;
    }
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
            <Badge color={getActionTypeColor(data.actionType)} variant="light" size="lg">
              {getActionTypeString(data.actionType)}
            </Badge>
          </Group>

          <Divider />

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <Title order={5}>기본 정보</Title>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    작업 시각
                  </Text>
                  <Text size="sm">{formatDate(data.created)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    IP 주소
                  </Text>
                  <Text size="sm">{formatText(data.ip)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    User-Agent
                  </Text>
                  <Text size="sm">{formatText(data.userAgent)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    대상 테이블
                  </Text>
                  <Text size="sm">{formatText(data.targetTable)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    대상 ID
                  </Text>
                  <Text size="sm">{formatText(data.targetId)}</Text>
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <Title order={5}>관련 정보</Title>

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

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    사용자명
                  </Text>
                  <Text size="sm">{formatText(data.managerName)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    로그인 ID
                  </Text>
                  <Text size="sm">{formatText(data.managerSignInId)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed">
                    작업 사유
                  </Text>
                  <Text size="sm">{formatText(data.reason)}</Text>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>

          {(data.oldValues || data.newValues) && (
            <>
              <Divider />
              <Stack gap="md">
                <Title order={5}>변경 내용</Title>

                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="xs">
                      <Text size="sm" fw={500} c="dimmed">
                        이전 값
                      </Text>
                      <Code block>{formatJsonText(data.oldValues)}</Code>
                    </Stack>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="xs">
                      <Text size="sm" fw={500} c="dimmed">
                        새로운 값
                      </Text>
                      <Code block>{formatJsonText(data.newValues)}</Code>
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Stack>
            </>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
