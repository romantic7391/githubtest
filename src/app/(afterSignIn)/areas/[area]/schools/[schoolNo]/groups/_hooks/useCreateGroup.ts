import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { CreateGroup } from '@/types/permission/group';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseCreateGroupProps {
  schoolNo: number;
}

interface CreateGroupParams {
  group: CreateGroup;
}

export default function useCreateGroup({ schoolNo }: UseCreateGroupProps) {
  const queryClient = useQueryClient();

  async function createData({ group }: CreateGroupParams) {
    const requestUrl = new URL(`/api/permission-admin/group`, window.location.origin);
    const body = JSON.stringify(group);
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!isJsonResponse(response)) {
      throw new HTTPStatusError('서버가 JSON 응답을 반환하지 않았습니다.', response.status);
    }

    const { success, message, data } = await response.json();

    if (!success) {
      throw new HTTPStatusError(message, response.status);
    }

    return data;
  }

  return useMutation({
    mutationFn: createData,
    onSuccess: () => {
      // 그룹 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['groups', schoolNo] });
    },
  });
}
