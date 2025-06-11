import type { Dispatch, SetStateAction } from 'react';
import { Group, Pagination, Select } from '@mantine/core';

export default function DevicePagination({
  totalPages,
  page,
  setPage,
  pageSize,
  setPageSize,
}: {
  totalPages: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
}) {
  return (
    <Group>
      <Pagination total={totalPages} value={page} onChange={setPage} />
      <Select
        data={[
          { value: '8', label: '8개 씩 보기' },
          { value: '10', label: '10개 씩 보기' },
          { value: '20', label: '20개 씩 보기' },
          { value: '50', label: '50개 씩 보기' },
          { value: '100', label: '100개 씩 보기' },
          { value: 'Infinity', label: '전체 보기' },
        ]}
        value={pageSize.toString()}
        onChange={(value) => {
          if (value === 'Infinity') {
            setPageSize(Number.MAX_SAFE_INTEGER);
          } else {
            setPageSize(Number(value));
          }
        }}
      />
    </Group>
  );
}
