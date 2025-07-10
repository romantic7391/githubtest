import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseDeleteGroupProps {
  area: string;
  schoolNo: number;
}

interface DeleteGroupParams {
  groupNo: number;
}

export default function useDeleteGroup({ area, schoolNo }: UseDeleteGroupProps) {
  const queryClient = useQueryClient();

  async function deleteData({ groupNo }: DeleteGroupParams) {
    const requestUrl = new URL(`/api/permission-admin/group/${groupNo}`, window.location.origin);
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
  }

  return useMutation({
    mutationFn: deleteData,
    onSuccess: () => {
      // 그룹 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['groups', area, schoolNo] });
    },
  });
}
