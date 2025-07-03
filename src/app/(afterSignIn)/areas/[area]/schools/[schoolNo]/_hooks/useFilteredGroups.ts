import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { Pagination, paginationSchema } from '@/types/common';
import { School } from '@/types/school';
import { useQuery } from '@tanstack/react-query';

interface UseFilteredGroupsProps {
  area: School['area'];
  schoolNo: School['schoolNo'];
  page: Pagination['page'];
  pageSize: Pagination['pageSize'];
}

export default function useFilteredGroups({ area = 'all', schoolNo, page, pageSize }: UseFilteredGroupsProps) {
  function getInitialData() {
    return {
      groups: [],
      pagination: paginationSchema.parse({}),
    };
  }

  async function fetchData() {
    const requestUrl = new URL(`/api/permission-admin/group`, window.location.origin);
    requestUrl.searchParams.set('schoolNo', schoolNo.toString());

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

    return data;
  }

  return useQuery({
    queryKey: ['groups', area, schoolNo, page, pageSize],
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
