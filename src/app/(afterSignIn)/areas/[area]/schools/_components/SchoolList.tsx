'use client';

import { Group, Pagination, Select, Stack, Text } from '@mantine/core';
import useFilteredSchools from '../_hooks/useFilteredSchools';
import { usePagination } from '@mantine/hooks';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SchoolCard from './SchoolCard';

interface SchoolListProps {
  sname: string | null;
  scode: string | null;
  page: number;
  pageSize: number;
}

export default function SchoolList({ sname, scode, page, pageSize }: SchoolListProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { data, isLoading } = useFilteredSchools({ sname, scode, page, pageSize });
  const totalPages = data.pagination.totalPages ?? 1;
  const pagination = usePagination({ total: totalPages, page, initialPage: 1, onChange: handleChangePage });

  function handleChangePage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.replace(`${pathname}?${params.toString()}`);
  }

  if (isLoading) {
    return <Text>학교 목록을 불러오고 있습니다.</Text>;
  }

  return (
    <>
      <Stack>
        <Stack>
          {data.schools.length > 0 && data.schools.map((school) => <SchoolCard key={school.schoolNo} {...school} />)}
        </Stack>
        <Group>
          <Pagination total={data.pagination.totalPages} value={page} onChange={pagination.setPage} />
          <Select
            w={80}
            data={['8', '10', '20', '50', '100']}
            value={pageSize.toString()}
            onChange={(value) => {
              if (!value) return;
              const params = new URLSearchParams(searchParams);
              params.set('pageSize', value);
              router.replace(`${pathname}?${params.toString()}`);
            }}
          />
          <Text>개 씩 보기</Text>
        </Group>
      </Stack>
    </>
  );
}
