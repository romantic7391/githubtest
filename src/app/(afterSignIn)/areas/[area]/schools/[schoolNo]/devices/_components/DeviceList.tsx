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
  const { data, status, isError, refetch } = useFilteredDevices({
    area,
    schoolNo,
    page,
    pageSize,
  });
  const [devices, setDevices] = useState<Device[]>(data?.items ?? []);
  // 센서 장치 추가 카드 1개 더 보여주기 위해 총 개수 + 1
  const total = (data?.pagination?.total ?? 0) + 1;
  const pagination = paginationSchema.parse({
    total,
    page: data?.pagination?.page ?? 1,
    pageSize: data?.pagination?.pageSize ?? DEFAULT_PAGE_SIZE,
    totalPages: Math.ceil(total / (data?.pagination?.pageSize ?? DEFAULT_PAGE_SIZE)),
  });

  useEffect(() => {
    console.log('devices info: ', status, data);
  }, [status, data]);

  useEffect(() => {
    if (isError) {
      setDevices([]);
    } else {
      setDevices(data?.items ?? []);
    }
  }, [data?.items, isError]);

  return (
    <Stack>
      <Grid>
        {devices.map((device, index) => (
          <Grid.Col key={`${index}_${device.mac}`} span={{ base: 12, md: 6, xl: 3 }}>
            <DeviceCard device={device} refetch={refetch} />
          </Grid.Col>
        ))}
        {/* 마지막 페이지일 때 센서 장치 추가 카드 표시 */}
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
