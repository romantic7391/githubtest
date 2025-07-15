import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseDeleteDeviceParams {
  area: string;
  schoolNo: number;
  mac: string;
}

export default function useDeleteDevice({ area, schoolNo, mac }: UseDeleteDeviceParams) {
  const queryClient = useQueryClient();

  async function deleteData() {
    const requestUrl = new URL(`/api/areas/${area}/schools/${schoolNo}/devices/${mac}`, window.location.origin);
    const response = await fetch(requestUrl, {
      method: 'DELETE',
    });

    if (!isJsonResponse(response)) {
      throw new HTTPStatusError('서버가 JSON 응답을 반환하지 않았습니다.', response.status);
    }

    const { success, message } = await response.json();

    if (!success) {
      throw new HTTPStatusError(message, response.status);
    }

    return success;
  }

  return useMutation({
    mutationFn: deleteData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices', area, schoolNo] });
    },
    throwOnError: () => {
      return false;
    },
  });
}
