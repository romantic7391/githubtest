'use client';

import { isJsonResponse } from '@/lib/util/common.util';
import type { Pagination } from '@/types/common';
import { paginationSchema } from '@/types/common';
import type { School, SchoolsApiResponse } from '@/types/school';
import { useQuery } from '@tanstack/react-query';

interface UseFilteredSchoolsProps {
  sname: School['sname'] | null;
  scode: School['scode'] | null;
  page: Pagination['page'];
  pageSize: Pagination['pageSize'];
}

export default function useFilteredSchools({ sname, scode, page, pageSize }: UseFilteredSchoolsProps) {
  function getInitialData(): SchoolsApiResponse['data'] {
    return {
      schools: [],
      pagination: paginationSchema.parse({}),
    };
  }

  async function fetchData(): Promise<SchoolsApiResponse['data']> {
    console.log('fetchData');
    const requestUrl = new URL('/api/areas/all/schools', window.location.origin);
    if (sname) {
      requestUrl.searchParams.set('sname', sname);
    }
    if (scode) {
      requestUrl.searchParams.set('scode', scode);
    }
    if (page) {
      requestUrl.searchParams.set('page', page.toString());
    }
    if (pageSize) {
      requestUrl.searchParams.set('pageSize', pageSize.toString());
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

    return data satisfies SchoolsApiResponse['data'];
  }

  return useQuery({
    queryKey: ['schools', sname, scode, page, pageSize],
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
