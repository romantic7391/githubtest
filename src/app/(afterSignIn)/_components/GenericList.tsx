'use client';

import type { Pagination } from '@/types/common';
import { Button, Card, Group, Pagination as MantinePagination, Select, Stack, Text, Title } from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import type { DefinedUseQueryResult } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { IconFilterOff } from '@tabler/icons-react';

interface GenericListProps<T, K extends string, TParams> {
  useQueryFn: (params: TParams) => DefinedUseQueryResult<
    {
      pagination: Pagination;
    } & { [Key in K]: T[] }
  >;
  hookParams: TParams;
  page: number;
  pageSize: number;
  ItemCard: React.ComponentType<T>;
}

export default function GenericList<T, K extends string, TParams>({
  useQueryFn,
  hookParams,
  page,
  pageSize,
  ItemCard,
}: GenericListProps<T, K, TParams>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { data, isSuccess, fetchStatus } = useQueryFn({
    ...hookParams,
    page,
    pageSize,
  });
  const totalPages = data.pagination.totalPages ?? 1;
  const pagination = usePagination({ total: totalPages, page, initialPage: 1, onChange: handleChangePage });

  const dataKey = Object.keys(data).find((key) => key !== 'pagination') as K;

  // 검색 파라미터가 있는지 확인 (page, pageSize 제외)
  const hasSearchParams = React.useMemo(() => {
    const searchParamKeys = Array.from(searchParams.keys());
    return searchParamKeys.some((key) => key !== 'page' && key !== 'pageSize');
  }, [searchParams]);

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

  if (fetchStatus !== 'idle') {
    return <>데이터를 불러오고 있습니다...</>;
  }

  if (isSuccess && fetchStatus === 'idle' && data[dataKey].length === 0) {
    return (
      <Stack>
        <Card withBorder>
          <Stack align="center" py="xl">
            <Title order={5}>검색 결과가 없습니다.</Title>
            <Text c="dimmed" ta="center">
              검색 조건을 변경하거나 다른 페이지를 확인해보세요.
            </Text>
            {hasSearchParams && (
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
        {data[dataKey].length > 0 && data[dataKey].map((item, index) => <ItemCard key={index} {...item} />)}
      </Stack>
      <Group justify="space-between">
        <Group>
          <MantinePagination total={data.pagination.totalPages} value={page} onChange={pagination.setPage} />
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
        {hasSearchParams && (
          <Button
            variant="light"
            color="gray"
            size="sm"
            onClick={handleClearFilters}
            leftSection={<IconFilterOff size={16} />}>
            필터 초기화
          </Button>
        )}
      </Group>
    </Stack>
  );
}
