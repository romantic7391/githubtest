'use client';

import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { UpdateManagerDto } from '@/types/manager';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateManagerParams {
  params: {
    area: string;
    schoolNo: number | 'all';
    managerNo: number;
  };
  manager: UpdateManagerDto;
}

export default function useUpdateManager({ area, schoolNo, managerNo }: UpdateManagerParams['params']) {
  const queryClient = useQueryClient();

  async function mutationFn(manager: UpdateManagerParams['manager']) {
    const requestUrl = new URL(`/api/areas/${area}/schools/${schoolNo}/managers/${managerNo}`, window.location.origin);
    const body = JSON.stringify(manager);
    const response = await fetch(requestUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!isJsonResponse(response)) {
      throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');
    }

    const { success, message } = await response.json();
    if (!success) {
      throw new HTTPStatusError(message, response.status);
    }

    return success;
  }

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager', managerNo] });
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
    throwOnError: () => {
      return false;
    },
  });
}
