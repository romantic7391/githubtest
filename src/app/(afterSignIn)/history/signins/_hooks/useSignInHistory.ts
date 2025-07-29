import { HTTPStatusError } from '@/lib/common.error';
import { useQuery } from '@tanstack/react-query';
import { isJsonResponse } from '@/lib/util/common.util';
import { SelectSignInHistoryResponseDto } from '@/types/manager-signin-history';

export default function useSignInHistory(historyNo: number) {
  async function fetchData() {
    const requestUrl = new URL(`/api/history/signins/${historyNo}`, window.location.origin);
    const response = await fetch(requestUrl, { method: 'GET' });

    if (!isJsonResponse(response)) {
      throw new HTTPStatusError('서버가 JSON 응답을 반환하지 않았습니다.', 500);
    }

    const { success, message, data } = await response.json();
    if (!success && response.status !== 404) {
      throw new HTTPStatusError(message, response.status);
    }

    return data as SelectSignInHistoryResponseDto['data'];
  }

  return useQuery({
    queryKey: ['signin-history', historyNo],
    retry: false,
    staleTime: 0,
    gcTime: 0,
    queryFn: fetchData,
  });
}
