import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { paginationSchema } from '@/types/common';
import { School, schoolSchema } from '@/types/school';
import { useQuery } from '@tanstack/react-query';

interface UseSchoolQueryParams {
  no: number;
}

export default function useSchoolQuery({ no }: UseSchoolQueryParams) {
  function getInitialData() {
    return {
      school: schoolSchema.parse({}),
      device: {
        devices: [],
        pagination: paginationSchema.parse({}),
      },
    };
  }

  async function fetchData(): Promise<SchoolWithDevicesApiResponse> {
    const requestURL = new URL(`/api/location/schools/${no}`, window.location.origin);

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
    queryKey: ['school', no],
    retry: false,
    initialData: getInitialData(),
    queryFn: fetchData,
    throwOnError: (error, query) => {
      console.error(error, query);
      throw error;
    },
  });
}
