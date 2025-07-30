'use client';

import { Grid, Card, Stack, Title, SimpleGrid } from '@mantine/core';
import {
  IconBuilding,
  IconUsers,
  IconDeviceMobile,
  IconCheck,
  IconLogin,
  IconLogs,
  IconLicense,
} from '@tabler/icons-react';
import {
  KPICard,
  TaskKPICard,
  ActivityItem,
  RegionDistributionCard,
  SystemStatusItem,
  QuickActionButton,
} from './Dashboard/index';

export default function Dashboard() {
  // 지역별 학교 분포 데이터
  const regionData = [
    {
      region: '서울',
      count: 8,
      percentage: 33,
      color: 'var(--mantine-color-blue-6)',
    },
    {
      region: '대전',
      count: 6,
      percentage: 25,
      color: 'var(--mantine-color-green-6)',
    },
    {
      region: '부산',
      count: 5,
      percentage: 21,
      color: 'var(--mantine-color-orange-6)',
    },
    {
      region: '기타',
      count: 5,
      percentage: 21,
      color: 'var(--mantine-color-purple-6)',
    },
  ];

  return (
    <Stack gap="md">
      {/* 주요 통계 카드 */}
      <Title order={3}>주요 지표</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <KPICard
          title="전체 학교"
          value={24}
          badge={{ text: '+2 이번 달', color: 'blue' }}
          icon={IconBuilding}
          iconColor="var(--mantine-color-blue-6)"
        />
        <TaskKPICard />
        <KPICard
          title="센서 장치"
          value={342}
          badge={{ text: '98% 온라인', color: 'orange' }}
          icon={IconDeviceMobile}
          iconColor="var(--mantine-color-orange-6)"
        />
        <KPICard
          title="오늘 로그인"
          value={89}
          badge={{ text: '+15% 어제 대비', color: 'red' }}
          icon={IconLogin}
          iconColor="var(--mantine-color-red-6)"
        />
      </SimpleGrid>

      {/* 시스템 상태 및 최근 활동 */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card withBorder padding="md" radius="md">
            <Title order={3} mb="md">
              최근 활동
            </Title>
            <Stack gap="md">
              <ActivityItem
                title="새로운 학교 등록"
                description="서울과학고등학교가 등록되었습니다."
                time="2시간 전"
                icon={IconBuilding}
                iconColor="var(--mantine-color-blue-6)"
              />
              <ActivityItem
                title="새로운 사용자 등록"
                description="김관리자님이 등록되었습니다."
                time="3시간 전"
                icon={IconUsers}
                iconColor="var(--mantine-color-green-6)"
              />
              <ActivityItem
                title="센서 장치 추가"
                description="대전고등학교에 새로운 센서가 추가되었습니다."
                time="5시간 전"
                icon={IconDeviceMobile}
                iconColor="var(--mantine-color-orange-6)"
              />
              <ActivityItem
                title="관리자 로그인"
                description="이관리자님이 시스템에 로그인했습니다."
                time="6시간 전"
                icon={IconLogin}
                iconColor="var(--mantine-color-red-6)"
              />
              <ActivityItem
                title="관리자 로그인"
                description="이관리자님이 시스템에 로그인했습니다."
                time="6시간 전"
                icon={IconLogin}
                iconColor="var(--mantine-color-red-6)"
              />
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md">
            {/* 지역별 학교 분포 */}
            <RegionDistributionCard regions={regionData} />

            {/* 시스템 상태 */}
            <Card withBorder padding="md" radius="md">
              <Title order={3} mb="md">
                시스템 상태
              </Title>
              <Stack gap="sm">
                <SystemStatusItem
                  name="데이터베이스"
                  status="정상"
                  statusColor="green"
                  icon={IconCheck}
                  iconColor="var(--mantine-color-green-6)"
                />
                <SystemStatusItem
                  name="센서 연결"
                  status="정상"
                  statusColor="green"
                  icon={IconCheck}
                  iconColor="var(--mantine-color-green-6)"
                />
              </Stack>
            </Card>

            {/* 빠른 액션 */}
            <Card withBorder padding="md" radius="md">
              <Title order={3} mb="md">
                빠른 액션
              </Title>
              <Stack gap="sm">
                <QuickActionButton text="학교 추가" href="/areas/all/schools/create" icon={IconBuilding} />
                <QuickActionButton text="권한 관리" href="/permissions" icon={IconLicense} />
                <QuickActionButton text="학교 관리" href="/areas/all/schools" icon={IconDeviceMobile} />
                <QuickActionButton text="이력 보기" href="/history/tasks" icon={IconLogs} />
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
