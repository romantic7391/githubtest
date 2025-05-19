'use client';

import { useMemo } from 'react';
import { Group, Pagination, ScrollArea, Stack, Title } from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import useSchoolSearchFilter from './_hooks/useSchoolSearchFilter';
import useSchoolQuery from './_hooks/useSchoolQuery';
import SchoolCard from './_components/SchoolCard';
import type { School } from '@/types/school';
import useSearch from './_hooks/useSearch';
import Search from './_components/Search';

export default function SchoolsPage() {
  const { search } = useSearch({});
  const filter = useSchoolSearchFilter();
  const { data, isError } = useSchoolQuery(filter);
  const schools = useMemo<School[]>(() => {
    if (!data) return [];
    return data?.schools;
  }, [data]);
  const total = useMemo(() => {
    if (!data) return 0;
    return data?.pagination.total;
  }, [data]);
  const pagination = usePagination({ total, initialPage: 1, page: filter.page, onChange: handleChangePage });

  function handleChangePage(page: number) {
    search('page', page.toString());
  }

  if (isError) {
    return <>에러남</>;
  }

  return (
    <Stack gap={10}>
      <Title order={3}>학교 관리</Title>
      <Search />
      <ScrollArea>
        <Stack gap={10}>
          {schools.length > 0 ? (
            <>
              {schools.map((school) => (
                <SchoolCard key={school.no} school={school} />
              ))}
            </>
          ) : (
            <>일치하는 내용이 없습니다.</>
          )}
        </Stack>
      </ScrollArea>
      <Group justify="center">
        <Pagination total={total} value={filter.page} onChange={pagination.setPage} />
      </Group>
    </Stack>
  );
}
