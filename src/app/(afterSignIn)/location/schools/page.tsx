'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Pagination, Stack, Title } from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import useSchoolSearchFilter from './_hooks/useSchoolSearchFilter';
import useSchoolQuery from './_hooks/useSchoolQuery';
import SchoolCard from './_components/SchoolCard';

export default function SchoolsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = useSchoolSearchFilter(searchParams);
  const { data, isError } = useSchoolQuery(filter);
  const schools = useMemo(() => {
    if (!data) return [];
    return data?.schools;
  }, [data]);
  const total = useMemo(() => {
    if (!data) return 0;
    return data?.pagination.total;
  }, [data]);
  const pagination = usePagination({ total, initialPage: 1, page: filter.page, onChange: onPageChange });

  if (isError) {
    return <>에러남</>;
  }

  function onPageChange(page: number) {
    const url = new URL(pathname, window.location.origin);
    searchParams.entries().forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    url.searchParams.set('page', page.toString());

    router.push(url.toString());
  }

  return (
    <main>
      <Stack gap={10}>
        <Title order={3}>학교 관리</Title>
        {schools.length > 0 ? schools.map((school) => <SchoolCard key={school.no} school={school} />) : <></>}
        <Pagination total={total} value={filter.page} onChange={pagination.setPage} />
      </Stack>
    </main>
  );
}
