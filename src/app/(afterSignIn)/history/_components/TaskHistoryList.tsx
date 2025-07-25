'use client';

import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { Group, Stack, Pagination as MantinePagination, Text, Card, Title, Table } from '@mantine/core';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import useFilteredTaskHistory from '../_hooks/useFilteredTaskHistory';
import { usePagination } from '@mantine/hooks';
import PageSizeSelector from './PageSizeSelector';
import useIsMobile from '@/app/_hooks/useIsMobile';

/**
 * 외부에서 받은 필터 객체를 통해서 작업 이력 목록을 조회합니다.
 */
export default function TaskHistoryList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const order = searchParams.get('order') as 'asc' | 'desc' | null;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE;
  const { data, fetchStatus, isSuccess } = useFilteredTaskHistory({
    page,
    pageSize,
    filters: {
      order,
    },
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

  function handleClickHistory(historyNo: number) {
    router.push(`${pathname}/${historyNo}`);
  }

  if (fetchStatus !== 'idle') {
    return <Text>데이터를 불러오고 있습니다...</Text>;
  }

  if (isSuccess && fetchStatus === 'idle' && histories.length === 0) {
    return (
      <Stack>
        <Card withBorder>
          <Stack>
            <Title order={5}>검색 결과가 없습니다.</Title>
            <Text>검색 조건을 변경해주십시오.</Text>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack>
        <Table stickyHeader stickyHeaderOffset={55} highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>#</Table.Th>
              <Table.Th>시각</Table.Th>
              {!isMobile && <Table.Th>IP 주소</Table.Th>}
              {!isMobile && <Table.Th>User-Agent</Table.Th>}
              {!isMobile && <Table.Th>소속명</Table.Th>}
              <Table.Th>사용자명</Table.Th>
              <Table.Th>분류</Table.Th>
              <Table.Th>설명</Table.Th>
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
                onClick={() => handleClickHistory(history.historyNo)}>
                <Table.Td>{history.historyNo}</Table.Td>
                <Table.Td>{history.created}</Table.Td>
                {!isMobile && <Table.Td>{history.ip}</Table.Td>}
                {!isMobile && <Table.Td>{history.userAgent}</Table.Td>}
                {!isMobile && <Table.Td>{history.schoolName}</Table.Td>}
                <Table.Td>{history.managerName}</Table.Td>
                <Table.Td>{getActionTypeString(history.actionType)}</Table.Td>
                <Table.Td>{history.reason}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
      <Group>
        <MantinePagination total={totalPages} value={page} onChange={pagination.setPage} />
        <PageSizeSelector />
      </Group>
    </Stack>
  );
}
