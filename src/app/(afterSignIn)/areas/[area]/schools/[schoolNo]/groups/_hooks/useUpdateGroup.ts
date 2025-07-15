import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { UpdateGroup } from '@/types/permission';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseUpdateGroupProps {
  schoolNo: number;
}

interface UpdateGroupParams {
  group: UpdateGroup;
}

export default function useUpdateGroup({ schoolNo }: UseUpdateGroupProps) {
  const queryClient = useQueryClient();

  async function updateData({ group }: UpdateGroupParams) {
    const requestUrl = new URL(`/api/permission-admin/group/${group.groupNo}`, window.location.origin);
    const body = JSON.stringify(group);
    const response = await fetch(requestUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
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
    mutationFn: updateData,
    onSuccess: () => {
      // 그룹 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['groups', schoolNo] });
    },
  });
}
