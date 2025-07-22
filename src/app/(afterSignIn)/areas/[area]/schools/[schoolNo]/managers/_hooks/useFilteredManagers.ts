'use client';

import { isJsonResponse } from '@/lib/util/common.util';
import type { Pagination } from '@/types/common';
import { paginationSchema } from '@/types/common';
import { ManagerListApiResponse, managerListApiResponseSchema } from '@/types/manager';
import { useQuery } from '@tanstack/react-query';

interface UseFilteredManagersProps {
  schoolNo: number | 'all';
  page: Pagination['page'];
  pageSize: Pagination['pageSize'];
  name?: string;
  signInId?: string;
  scode?: string;
  area?: string;
}

export default function useFilteredManagers({
  schoolNo,
  page,
  pageSize,
  name,
  signInId,
  scode,
  area,
}: UseFilteredManagersProps) {
  function getInitialData(): ManagerListApiResponse['data'] {
    return {
      managers: [],
      pagination: paginationSchema.parse({}),
    };
  }

  async function fetchData(): Promise<ManagerListApiResponse['data']> {
    const requestUrl = new URL(`/api/areas/${area}/schools/${schoolNo}/managers`, window.location.origin);
    if (page) {
      requestUrl.searchParams.set('page', page.toString());
    }
    if (pageSize) {
      requestUrl.searchParams.set('pageSize', pageSize.toString());
    }
    if (name) {
      requestUrl.searchParams.set('name', name);
    }
    if (signInId) {
      requestUrl.searchParams.set('signInId', signInId);
    }
    if (scode) {
      requestUrl.searchParams.set('scode', scode);
    }

    const response = await fetch(requestUrl, { method: 'GET' });

    if (!isJsonResponse(response)) {
      throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');
    }

    const { success, message, data } = await response.json();
    if (!success && response.status !== 404) {
      throw new Error(message);
    }

    if (response.status === 404) {
      return getInitialData();
    }

    return managerListApiResponseSchema.shape.data.parse(data);
  }

  return useQuery({
    queryKey: ['managers', schoolNo, name, signInId, scode, area, page, pageSize],
    retry: false,
    staleTime: 0,
    gcTime: 0,
    initialData: getInitialData(),
    queryFn: fetchData,
    throwOnError: (error, query) => {
      console.error(error, query);
      return true;
    },
  });
}
