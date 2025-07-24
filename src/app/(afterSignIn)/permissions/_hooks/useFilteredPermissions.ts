import { isJsonResponse } from '@/lib/util/common.util';
import { paginationSchema } from '@/types/common';
import { useQuery } from '@tanstack/react-query';

interface UseFilteredPermissionsProps {
  name: string | null;
  page: number;
  pageSize: number;
}

export default function useFilteredPermissions({ name, page, pageSize }: UseFilteredPermissionsProps) {
  function getInitialData() {
    return {
      permissions: [],
      pagination: paginationSchema.parse({}),
    };
  }

  async function fetchData() {
    const requestUrl = new URL(`/api/permission-admin/permission`, window.location.origin);
    if (name) {
      requestUrl.searchParams.set('name', name);
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

    return data;
  }

  return useQuery({
    queryKey: ['permissions', name, page, pageSize],
    retry: false,
    staleTime: 0,
    gcTime: 0,
    initialData: getInitialData(),
    queryFn: fetchData,
    throwOnError: true,
  });
}
