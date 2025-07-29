'use client';

import {
  Group,
  Stack,
  Pagination as MantinePagination,
  Text,
  Card,
  Title,
  Table,
  Loader,
  Alert,
  Badge,
} from '@mantine/core';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import useFilteredSignInHistory from '../_hooks/useFilteredSignInHistory';
import { usePagination } from '@mantine/hooks';
import PageSizeSelector from '../../_components/PageSizeSelector';
import useIsMobile from '@/app/_hooks/useIsMobile';
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import dayjs from '@/lib/dayjs';
import { SignInHistoryFilter } from '@/types/manager-signin-history';

/**
 * 외부에서 받은 필터 객체를 통해서 로그인 이력 목록을 조회합니다.
 */
export default function SignInHistoryList({
  page,
  pageSize,
  filters,
}: {
  page: number;
  pageSize: number;
  filters: SignInHistoryFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data, fetchStatus, isSuccess, error, isError } = useFilteredSignInHistory({
    page,
    pageSize,
    filters,
  });
  const histories = data.histories;
  const totalPages = Math.max(1, data.pagination.totalPages);
  const pagination = usePagination({ total: totalPages, page, initialPage: 1, onChange: handleChangePage });
  const isMobile = useIsMobile();

  function handleChangePage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', Math.max(1, page).toString());
    router.push(`${pathname}?${params.toString()}`);
  }

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

  function formatText(text: string | null, maxLength: number = 50) {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  }

  function handleClickHistory(historyNo: number) {
    router.push(`${pathname}/${historyNo}`);
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
        <Text size="sm">{error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.'}</Text>
      </Alert>
    );
  }

  // 빈 데이터 상태
  if (isSuccess && fetchStatus === 'idle' && histories.length === 0) {
    return (
      <Stack>
        <Card withBorder>
          <Stack align="center" py="xl">
            <IconInfoCircle size="3rem" color="var(--mantine-color-gray-4)" />
            <Title order={5}>검색 결과가 없습니다</Title>
            <Text size="sm" c="dimmed" ta="center">
              검색 조건을 변경하거나 다른 페이지를 확인해보세요.
            </Text>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack>
        <Table
          stickyHeader
          stickyHeaderOffset={55}
          highlightOnHover
          withTableBorder
          withColumnBorders
          aria-label="로그인 이력 목록">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>#</Table.Th>
              <Table.Th>로그인 시각</Table.Th>
              <Table.Th>로그아웃 시각</Table.Th>
              {!isMobile && <Table.Th>IP 주소</Table.Th>}
              {!isMobile && <Table.Th>소속명</Table.Th>}
              <Table.Th>사용자명</Table.Th>
              <Table.Th>로그인 ID</Table.Th>
              <Table.Th>성공 여부</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {histories.map((history) => (
              <Table.Tr
                key={history.historyNo}
                styles={{
                  tr: {
                    cursor: 'pointer',
                  },
                }}
                onClick={() => handleClickHistory(history.historyNo)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClickHistory(history.historyNo);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`이력 ${history.historyNo} 상세보기`}>
                <Table.Td>{history.historyNo}</Table.Td>
                <Table.Td>{formatDate(history.signInTime)}</Table.Td>
                <Table.Td>{formatDate(history.signOutTime)}</Table.Td>
                {!isMobile && <Table.Td>{formatText(history.ip, 15)}</Table.Td>}
                {!isMobile && <Table.Td>{formatText(history.schoolName)}</Table.Td>}
                <Table.Td>{formatText(history.managerName)}</Table.Td>
                <Table.Td>{formatText(history.signInId)}</Table.Td>
                <Table.Td>
                  <Badge color={getSuccessColor(history.success)} variant="light" size="sm">
                    {getSuccessString(history.success)}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
      <Group justify="space-between">
        <Group>
          <MantinePagination total={totalPages} value={page} onChange={pagination.setPage} />
          <PageSizeSelector />
        </Group>
        <Text size="sm" c="dimmed">
          총 {data.pagination.total}개 중 {(page - 1) * pageSize + 1} -{' '}
          {Math.min(page * pageSize, data.pagination.total)}개 표시
        </Text>
      </Group>
    </Stack>
  );
}
