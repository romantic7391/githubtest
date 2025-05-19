import type { SchoolApiResponse } from '@/types/school';
import { schoolApiResponseSchema } from '@/types/school';
import { useQuery } from '@tanstack/react-query';

interface UseSchoolQueryParams {
  schoolNo: number;
}

/**
 * 학교 조회
 *
 * @param no - 학교 번호
 * @returns 학교 정보
 */
export default function useSchoolQuery({ schoolNo }: UseSchoolQueryParams) {
  function getInitialData(): SchoolApiResponse {
    return schoolApiResponseSchema.parse({});
  }

  async function fetchData(): Promise<SchoolApiResponse> {
    const requestURL = new URL(`/api/location/schools/${schoolNo}`, window.location.origin);

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
    queryKey: ['school', schoolNo],
    retry: false,
    initialData: getInitialData(),
    queryFn: fetchData,
    throwOnError: (error, query) => {
      console.error(error, query);
      throw error;
    },
  });
}
