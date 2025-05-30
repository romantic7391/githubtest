'use client';

import { Button, Card, Code, Flex, Grid, Group, Pagination, Select, Stack, Text, TextInput } from '@mantine/core';
import useFilteredDevices from '../_hooks/useFilteredDevices';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { usePagination } from '@mantine/hooks';

export default function DeviceList({ area, schoolNo }: { area: string; schoolNo: number }) {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const { data } = useFilteredDevices({
    area,
    schoolNo,
    page,
    pageSize,
  });
  const {} = usePagination({ total: data?.pagination.total, page, onChange: setPage });

  return (
    <Stack>
      {/* 헤더 */}
      <Card withBorder>
        <Grid>
          <Grid.Col span={{ base: 'content', md: 'content' }}>
            <Flex h="100%" align="center">
              <Text component="label" htmlFor="device-search" fw="bold">
                검색
              </Text>
            </Flex>
          </Grid.Col>
          <Grid.Col span={{ base: 3, xs: 2, lg: 1 }}>
            <Select
              id="device-search"
              allowDeselect={false}
              data={[
                { value: 'name', label: '이름' },
                { value: 'mac', label: 'MAC' },
              ]}
              defaultValue="name"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 'auto' }}>
            <TextInput id="device-search" placeholder="검색어를 입력해주세요." />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 'content' }}>
            <Group>
              <Button px={10} onClick={() => {}}>
                <Group gap={5}>
                  <IconSearch size={16} stroke={3} />
                  검색
                </Group>
              </Button>
              <Button px={10} onClick={() => {}} color="red">
                초기화
              </Button>
              <Button px={10} onClick={() => {}}>
                <Group gap={5}>
                  <IconPlus size={16} stroke={3} />
                  장치 추가
                </Group>
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Card>

      {/* 목록 */}
      {data && data.devices.length === 0 && <Text>등록된 장치가 없습니다.</Text>}

      {/* 페이지네이션 */}
      <Group>
        <Pagination total={data?.pagination.totalPages} value={page} onChange={setPage} />
        <Select
          data={[
            { value: '8', label: '8개 씩 보기' },
            { value: '10', label: '10개 씩 보기' },
            { value: '20', label: '20개 씩 보기' },
            { value: '50', label: '50개 씩 보기' },
            { value: '100', label: '100개 씩 보기' },
          ]}
          value={pageSize.toString()}
          onChange={(value) => setPageSize(Number(value))}
        />
      </Group>
      <Code block>{JSON.stringify(data, null, 2)}</Code>
    </Stack>
  );
}
