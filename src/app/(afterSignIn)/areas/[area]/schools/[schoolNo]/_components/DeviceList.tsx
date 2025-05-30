'use client';

import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import useFilteredDevices from '../_hooks/useFilteredDevices';
import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { paginationSchema } from '@/types/common';
import { DeviceRelForm, deviceRelFormSchema } from '@/types/device';
import ZodErrorDisplay from '@/app/(afterSignIn)/_components/ZodErrorDisplay';
import { Card, Grid, Stack } from '@mantine/core';
import DevicePagination from './DevicePagination';
import DeviceCard from './DeviceCard';

export default function DeviceList({ area, schoolNo }: { area: string; schoolNo: number }) {
  // const [searchType, setSearchType] = useState<string>('name');
  // const [searchValue, setSearchValue] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const { data } = useFilteredDevices({
    area,
    schoolNo,
    page,
    pageSize,
  });
  const devices = data?.devices ?? [];
  const pagination = data?.pagination ?? paginationSchema.parse({});

  const form = useForm<{ devices: DeviceRelForm[] }>({
    initialValues: {
      devices,
    },

    validate: {
      devices: {
        mac: (value) => {
          const { error } = deviceRelFormSchema.shape.mac.safeParse(value);
          if (error) return <ZodErrorDisplay error={error} />;
        },
        summary: (value) => {
          const { error } = deviceRelFormSchema.shape.summary.safeParse(value);
          if (error) return <ZodErrorDisplay error={error} />;
        },
      },
    },
  });

  useEffect(() => {
    form.setValues({
      devices,
    });
    form.setInitialValues({
      devices,
    });
  }, [devices]);

  // useEffect(() => {
  //   console.log('검색: ', searchType, searchValue);
  // }, [searchType, searchValue]);

  return (
    <Stack>
      {/* <DeviceSearchCard
        searchType={searchType}
        setSearchType={setSearchType}
        setSearchValue={setSearchValue}
      /> */}

      <Grid>
        {devices.map((device, index) => (
          <Grid.Col key={`${index}_${device.mac}`} span={{ base: 12, md: 6, xl: 3 }}>
            <DeviceCard index={index} device={device} form={form} />
          </Grid.Col>
        ))}
        {pagination.page === pagination.totalPages && (
          <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
            <Card withBorder h="100%" w="100%">
              TODO: 장치 추가
            </Card>
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
