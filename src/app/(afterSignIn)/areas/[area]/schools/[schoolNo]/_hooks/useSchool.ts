import { useQuery } from '@tanstack/react-query';
import type { School, SchoolApiResponse } from '@/types/school';
import { isJsonResponse } from '@/lib/util/common.util';
import { HTTPStatusError } from '@/lib/common.error';

export default function useSchool({ area = 'all', schoolNo }: { area?: string; schoolNo: School['schoolNo'] }) {
  function getInitialData(): SchoolApiResponse['data'] {
    return {
      schoolNo: 0,
      sname: '',
      scode: '',
      area: null,
      administrationCode: null,
      useOrderSheet: 'N',
      parentNo: null,
      modbus: 0,
      modbusHost: null,
      modbusPort: 0,
      active: 'N',
      created: null,
    };
  }

  async function fetchData(): Promise<SchoolApiResponse['data']> {
    const requestUrl = new URL(`/api/areas/${area ?? 'all'}/schools/${schoolNo}`, window.location.origin);
    const response = await fetch(requestUrl, { method: 'GET' });
    if (!isJsonResponse(response)) {
      throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');
    }

    const { success, message, data } = await response.json();

    if (!success) {
      throw new HTTPStatusError(message, response.status);
    }

    return data satisfies SchoolApiResponse['data'];
  }

  return useQuery({
    queryKey: ['school', area, schoolNo],
    retry: false,
    staleTime: 0,
    gcTime: 0,
    initialData: getInitialData(),
    queryFn: fetchData,
    throwOnError: () => {
      return true;
    },
  });
}
