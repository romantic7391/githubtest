import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { paginationSchema } from '@/types/common';
import { SelectSignInHistoriesRequestDto, SelectSignInHistoriesResponseDto } from '@/types/manager-signin-history';
import { useQuery } from '@tanstack/react-query';

interface UseFilteredSignInHistoryProps {
  page: number;
  pageSize: number;
  filters: SelectSignInHistoriesRequestDto['filters'];
}

export default function useFilteredSignInHistory({ page, pageSize, filters }: UseFilteredSignInHistoryProps) {
  function getInitialData(): SelectSignInHistoriesResponseDto['data'] {
    return {
      histories: [],
      pagination: paginationSchema.parse({}),
    };
  }

  async function fetchData(): Promise<SelectSignInHistoriesResponseDto['data']> {
    const requestUrl = new URL('/api/history/signins', window.location.origin);
    if (page) {
      requestUrl.searchParams.set('page', page.toString());
    }
    if (pageSize) {
      requestUrl.searchParams.set('pageSize', pageSize.toString());
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        requestUrl.searchParams.set(key, value.toString());
      }
    }

    const response = await fetch(requestUrl, { method: 'GET' });

    if (!isJsonResponse(response)) {
      throw new HTTPStatusError('서버가 JSON 응답을 반환하지 않았습니다.', 500);
    }

    const { success, message, data } = await response.json();
    if (!success && response.status !== 404) {
      throw new HTTPStatusError(message, response.status);
    }

    if (response.status === 404) {
      return getInitialData();
    }

    return data;
  }

  return useQuery({
    queryKey: ['filtered-signin-history', page, pageSize, ...Object.values(filters)],
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
