'use client';

import { Box, Card, Group, Pagination, Select, Stack, Text, Title } from '@mantine/core';
import useFilteredSchools from '../_hooks/useFilteredSchools';
import { usePagination } from '@mantine/hooks';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SchoolCard from './SchoolCard';
import SchoolAddButton from './SchoolAddButton';

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

  const { data, isSuccess, fetchStatus } = useFilteredSchools({ sname, scode, page, pageSize });
  const totalPages = data.pagination.totalPages ?? 1;
  const pagination = usePagination({ total: totalPages, page, initialPage: 1, onChange: handleChangePage });

  function handleChangePage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.replace(`${pathname}?${params.toString()}`);
  }

  if (fetchStatus !== 'idle') {
    return <>데이터를 불러오고 있습니다...</>;
  }

  if (isSuccess && fetchStatus === 'idle' && data.schools.length === 0) {
    return (
      <Stack>
        <Card withBorder>
          <Stack>
            <Title order={5}>검색 결과가 없습니다.</Title>
            <Text>검색 조건을 변경하거나 학교를 추가해주십시오.</Text>
            <Box w="200px">
              <SchoolAddButton />
            </Box>
          </Stack>
        </Card>
      </Stack>
    );
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
