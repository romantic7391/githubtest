'use client';

import { Pagination, Stack, Title } from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import useSchoolQuery from '../_hooks/useSchoolQuery';
import { SchoolItem } from './SchoolItem';

export default function SchoolList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data } = useSchoolQuery({ page, pageSize });
  const schools = data?.schools ?? [];
  const total = data?.pagination.total ?? 0;
  const pagination = usePagination({ total, initialPage: 1, page, onChange: setPage });

  function handlePageChange(value: number) {
    pagination.setPage(value);
  }

  useEffect(() => {
    console.log('page', page);
  }, [page]);

  if (total === 0) {
    return <Title order={3}>학교 목록이 없습니다.</Title>;
  }

  return (
    <>
      <Stack gap={10}>
        {schools.map((school: any) => (
          <SchoolItem key={school.no} no={school.no} name={school.sname} code={school.scode} />
        ))}
      </Stack>
      <Pagination total={total} value={page} onChange={handlePageChange} hideWithOnePage={false} />
    </>
  );
}
