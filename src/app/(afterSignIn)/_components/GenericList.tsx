'use client';

import type { Pagination } from '@/types/common';
import { Card, Group, Pagination as MantinePagination, Select, Stack, Text, Title } from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import type { DefinedUseQueryResult } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

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

  function handleChangePage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  if (fetchStatus !== 'idle') {
    return <>데이터를 불러오고 있습니다...</>;
  }

  if (isSuccess && fetchStatus === 'idle' && data[dataKey].length === 0) {
    return (
      <Stack>
        <Card withBorder>
          <Stack>
            <Title order={5}>검색 결과가 없습니다.</Title>
            <Text>검색 조건을 변경하거나 학교를 추가해주십시오.</Text>
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
    </Stack>
  );
}
