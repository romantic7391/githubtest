import { Box, Card, Group as MantineGroup, Pagination, Select, Stack, Text, Title, Button } from '@mantine/core';
import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import useFilteredGroups from '../_hooks/useFilteredGroups';
import GroupCard from './GroupCard';
import { IconPlus } from '@tabler/icons-react';

export default function GroupList({ area, schoolNo }: { area: string; schoolNo: number }) {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const { data, isLoading, isError } = useFilteredGroups({
    area,
    schoolNo,
    page,
    pageSize,
  });

  const groups = data?.groups || [];
  const pagination = data?.pagination || { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0, totalPages: 1 };

  if (isLoading) {
    return (
      <Stack>
        <Card withBorder>
          <Text>그룹 목록을 불러오고 있습니다...</Text>
        </Card>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Stack>
        <Card withBorder>
          <Stack>
            <Title order={5}>오류가 발생했습니다.</Title>
            <Text>그룹 목록을 불러오는 중 문제가 발생했습니다.</Text>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (groups.length === 0) {
    return (
      <Stack>
        <Card withBorder>
          <Stack>
            <Title order={5}>등록된 그룹이 없습니다.</Title>
            <Text>이 학교에는 아직 등록된 그룹이 없습니다.</Text>
            <Box w="200px">
              <Button leftSection={<IconPlus size={16} />} variant="light">
                그룹 추가
              </Button>
            </Box>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack>
      <MantineGroup justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={3}>그룹 목록</Title>
          <Text size="sm" c="dimmed">
            총 {pagination.total}개의 그룹
          </Text>
        </Stack>
        <Button leftSection={<IconPlus size={16} />} variant="light">
          그룹 추가
        </Button>
      </MantineGroup>

      <Stack>
        {groups.map((group) => (
          <GroupCard key={group.group_no} {...group} />
        ))}
      </Stack>

      <MantineGroup justify="space-between" align="center">
        <Pagination total={pagination.totalPages} value={page} onChange={setPage} />
        <MantineGroup>
          <Select
            w={80}
            data={['8', '10', '20', '50', '100']}
            value={pageSize.toString()}
            onChange={(value) => {
              if (!value) return;
              setPage(1);
              setPageSize(Number(value));
            }}
          />
          <Text>개 씩 보기</Text>
        </MantineGroup>
      </MantineGroup>
    </Stack>
  );
}
