'use client';

import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import useFilteredDevices from '../_hooks/useFilteredDevices';
import { useEffect, useState } from 'react';
import { paginationSchema } from '@/types/common';
import { Device } from '@/types/device';
import { Grid, Stack } from '@mantine/core';
import DevicePagination from './DevicePagination';
import DeviceCard from './DeviceCard';

export default function DeviceList({ area, schoolNo }: { area: string; schoolNo: number }) {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const { data, refetch, isRefetching } = useFilteredDevices({
    area,
    schoolNo,
    page,
    pageSize,
  });
  const [devices, setDevices] = useState<Device[]>(data?.items ?? []);
  const pagination = data?.pagination ?? paginationSchema.parse({});

  useEffect(() => {
    console.log('data?.items: ', data?.items);
    setDevices(data?.items ?? []);
  }, [data?.items]);

  useEffect(() => {
    console.log('isRefetching: ', isRefetching);
  }, [isRefetching]);

  return (
    <Stack>
      <Grid>
        {devices.map((device, index) => (
          <Grid.Col key={`${index}_${device.mac}`} span={{ base: 12, md: 6, xl: 3 }}>
            <DeviceCard device={device} refetch={refetch} />
          </Grid.Col>
        ))}
        {page === pagination.totalPages && (
          <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
            <DeviceCard device={undefined} refetch={refetch} />
          </Grid.Col>
        )}
      </Grid>

      {/* 페이지네이션 */}
      <DevicePagination
        totalPages={pagination.totalPages}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
    </Stack>
  );
}
