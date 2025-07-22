'use client';

import { isJsonResponse } from '@/lib/util/common.util';
import { Manager } from '@/types/manager';
import { useQuery } from '@tanstack/react-query';

export default function useManager({ managerNo }: { managerNo: number }) {
  async function fetchData(): Promise<Manager> {
    const requestUrl = new URL(`/api/areas/all/schools/all/managers/${managerNo}`, window.location.origin);
    const response = await fetch(requestUrl, { method: 'GET' });
    if (!isJsonResponse(response)) {
      throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');
    }

    const { success, message, data } = await response.json();
    if (!success) {
      throw new Error(message);
    }

    return data as Manager;
  }

  return useQuery({
    queryKey: ['manager', managerNo],
    retry: false,
    staleTime: 0,
    gcTime: 0,
    queryFn: fetchData,
  });
}
