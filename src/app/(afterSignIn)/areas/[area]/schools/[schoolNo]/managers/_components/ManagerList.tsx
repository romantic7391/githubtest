'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Stack,
  Group,
  Button,
  Grid,
  Text,
  Title,
  Loader,
  Alert,
  Pagination as MantinePagination,
  Card,
  Select,
} from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import { IconInfoCircle, IconAlertCircle, IconRefresh, IconFilterOff } from '@tabler/icons-react';
import useFilteredManagers from '../_hooks/useFilteredManagers';
import ManagerCard from './ManagerCard';

interface ManagerListProps {
  area: string;
  schoolNo: number;
  scode?: string;
  name?: string;
  signInId?: string;
  page: number;
  pageSize: number;
}

export default function ManagerList({
  area,
  schoolNo,
  scode = undefined,
  name,
  signInId,
  page,
  pageSize,
}: ManagerListProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { data, isSuccess, fetchStatus, error, isError, refetch } = useFilteredManagers({
    area,
    schoolNo,
    scode,
    name,
    signInId,
    page,
    pageSize,
  });

  const managers = data?.managers || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const pagination = usePagination({ total: totalPages, page, initialPage: 1, onChange: handleChangePage });

  function handleChangePage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClearFilters() {
    const params = new URLSearchParams();
    // page와 pageSize는 유지
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  function hasActiveFilters(): boolean {
    return !!(name || signInId || scode || searchParams.get('searchKey') || searchParams.get('searchValue'));
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
      <Alert icon={<IconAlertCircle size="1rem" />} title="오류가 발생했습니다" color="red">
        <Stack>
          <Text size="sm">{error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.'}</Text>
          <Button size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </Stack>
      </Alert>
    );
  }

  // 빈 데이터 상태
  if (isSuccess && fetchStatus === 'idle' && managers.length === 0) {
    return (
      <Stack>
        <Card withBorder>
          <Stack align="center" py="xl">
            <IconInfoCircle size="3rem" color="var(--mantine-color-gray-4)" />
            <Title order={5}>검색 결과가 없습니다</Title>
            <Text size="sm" c="dimmed" ta="center">
              검색 조건을 변경하거나 다른 페이지를 확인해보세요.
            </Text>
            {hasActiveFilters() && (
              <Button
                variant="light"
                color="gray"
                onClick={handleClearFilters}
                leftSection={<IconFilterOff size={16} />}>
                모든 필터 초기화
              </Button>
            )}
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack>
        <Grid>
          {managers.map((manager) => (
            <Grid.Col key={manager.managerNo} span={{ base: 12 }}>
              <ManagerCard {...manager} />
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
      <Group justify="space-between">
        <Group>
          <MantinePagination total={totalPages} value={page} onChange={pagination.setPage} />
          <Select
            w={80}
            data={['8', '10', '20', '50', '100']}
            value={pageSize.toString()}
            onChange={(value) => {
              if (!value) return;
              const params = new URLSearchParams(searchParams);
              params.set('page', '1');
              params.set('pageSize', value);
              router.push(`${pathname}?${params.toString()}`);
            }}
          />
          <Text>개 씩 보기</Text>
        </Group>
        <Group>
          <Button variant="light" size="sm" onClick={() => refetch()} leftSection={<IconRefresh size="1rem" />}>
            새로고침
          </Button>
          {hasActiveFilters() && (
            <Button
              variant="light"
              color="gray"
              size="sm"
              onClick={handleClearFilters}
              leftSection={<IconFilterOff size="1rem" />}>
              필터 초기화
            </Button>
          )}
        </Group>
      </Group>
      <Text size="sm" c="dimmed" ta="center">
        총 {data?.pagination?.total || 0}개 중 {(page - 1) * pageSize + 1} -{' '}
        {Math.min(page * pageSize, data?.pagination?.total || 0)}개 표시
      </Text>
    </Stack>
  );
}
