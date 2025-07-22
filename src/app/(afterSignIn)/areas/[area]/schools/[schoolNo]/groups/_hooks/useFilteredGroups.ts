import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { paginationSchema } from '@/types/common';
import type { GroupsApiResponse } from '@/types/permission/group';
import type { School } from '@/types/school';
import { useQuery } from '@tanstack/react-query';

interface UseFilteredGroupsProps {
  schoolNo: School['schoolNo'];
}

export default function useFilteredGroups({ schoolNo }: UseFilteredGroupsProps) {
  function getInitialData(): GroupsApiResponse['data'] {
    return {
      groups: [],
      pagination: paginationSchema.parse({}),
    } satisfies GroupsApiResponse['data'];
  }

  async function fetchData(): Promise<GroupsApiResponse['data']> {
    const requestUrl = new URL(`/api/permission-admin/group`, window.location.origin);
    requestUrl.searchParams.set('schoolNo', schoolNo.toString());
    requestUrl.searchParams.set('page', '1');
    requestUrl.searchParams.set('pageSize', Number.MAX_SAFE_INTEGER.toString());

    const response = await fetch(requestUrl, { method: 'GET' });

    if (!isJsonResponse(response)) {
      throw new HTTPStatusError('서버가 JSON 응답을 반환하지 않았습니다.', response.status);
    }

    const { success, message, data } = await response.json();

    if (response.status === 404) {
      return getInitialData();
    }

    if (!success) {
      throw new HTTPStatusError(message, response.status);
    }

    return data satisfies GroupsApiResponse['data'];
  }

  return useQuery({
    queryKey: ['groups', schoolNo],
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
