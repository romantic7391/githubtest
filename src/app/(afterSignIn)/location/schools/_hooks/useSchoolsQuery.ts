import type { SchoolApiResponse, SchoolSearchFilter } from '@/types/school';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { useQuery } from '@tanstack/react-query';

export default function useSchoolsQuery({ page, pageSize, snames, scodes, stypes }: SchoolSearchFilter) {
  function getInitialData(): SchoolApiResponse {
    return {
      schools: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
      },
    };
  }

  async function fetchData(): Promise<SchoolApiResponse> {
    const requestURL = new URL('/api/location/schools', window.location.origin);
    requestURL.searchParams.set('page', page.toString());
    requestURL.searchParams.set('pagesize', pageSize.toString());
    requestURL.searchParams.set('snames', snames.join(','));
    requestURL.searchParams.set('scodes', scodes.join(','));
    requestURL.searchParams.set('stypes', stypes.join(','));

    const response = await fetch(requestURL, { method: 'GET' });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');
    }

    const { success, message, data } = await response.json();
    if (!success && response.status !== 404) {
      throw new Error(message);
    }

    if (!data) {
      return getInitialData();
    }

    return data;
  }

  return useQuery({
    queryKey: ['schools', page, pageSize, snames, scodes, stypes],
    retry: false,
    initialData: getInitialData(),
    queryFn: fetchData,
    throwOnError: (error, query) => {
      console.error(error, query);
      throw error;
    },
  });
}
