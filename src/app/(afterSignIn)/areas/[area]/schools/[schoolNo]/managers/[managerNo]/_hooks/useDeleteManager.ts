'use client';

import { isJsonResponse } from '@/lib/util/common.util';
import { HTTPStatusError } from '@/lib/common.error';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useDeleteManager() {
  const queryClient = useQueryClient();
  async function mutationFn(managerNo: number) {
    const requestUrl = `/api/areas/all/schools/all/managers/${managerNo}`;
    const response = await fetch(requestUrl, { method: 'DELETE' });
    if (!isJsonResponse) throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');

    const { success, message } = await response.json();
    if (!success) {
      throw new HTTPStatusError(message, response.status);
    }

    return success;
  }

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
    throwOnError: () => {
      return false;
    },
  });
}
