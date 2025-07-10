'use client';

import { paginationSchema, type Pagination } from '@/types/common';
import type { School } from '@/types/school';
import type { DevicesApiResponse } from '@/types/device';
import { useQuery } from '@tanstack/react-query';
import { isJsonResponse } from '@/lib/util/common.util';
import { HTTPStatusError } from '@/lib/common.error';

interface UseFilteredDevicesProps {
  area: School['area'];
  schoolNo: School['schoolNo'];
  page: Pagination['page'];
  pageSize: Pagination['pageSize'];
}

export default function useFilteredDevices({ area = 'all', schoolNo, page, pageSize }: UseFilteredDevicesProps) {
  function getInitialData(): DevicesApiResponse['data'] {
    return {
      items: [],
      pagination: paginationSchema.parse({}),
    };
  }

  async function fetchData(): Promise<DevicesApiResponse['data']> {
    const requestUrl = new URL(`/api/areas/${area}/schools/${schoolNo}/devices`, window.location.origin);
    if (page) {
      requestUrl.searchParams.set('page', page.toString());
    }
    if (pageSize) {
      requestUrl.searchParams.set('pageSize', pageSize.toString());
    }

    const response = await fetch(requestUrl, { method: 'GET' });

    if (!isJsonResponse(response)) {
      throw new HTTPStatusError('서버가 JSON 응답을 반환하지 않았습니다.', response.status);
    }

    const { success, message, data } = await response.json();

    if (!success) {
      throw new HTTPStatusError(message, response.status);
    }

    if (response.status === 404) {
      return getInitialData();
    }

    return data satisfies DevicesApiResponse['data'];
  }

  return useQuery({
    queryKey: ['devices', area, schoolNo, page, pageSize],
    retry: false,
    staleTime: 0,
    gcTime: 0,
    initialData: getInitialData(),
    queryFn: fetchData,
    throwOnError: () => {
      return false;
    },
  });
}
