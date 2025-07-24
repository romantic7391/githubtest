import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { Permission, PermissionUpdateResponse } from '@/types/permission/permission';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdatePermissionParams {
  params: {
    permissionNo: number;
  };
  permission: Permission;
}

export default function useUpdatePermission() {
  const queryClient = useQueryClient();

  async function updateData({ params, permission }: UpdatePermissionParams): Promise<PermissionUpdateResponse> {
    const { permissionNo } = params;
    const requestUrl = new URL(`/api/permission-admin/permission/${permissionNo}`, window.location.origin);
    const body = JSON.stringify(permission);

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

    const { success, message, data } = await response.json();
    if (!success) {
      throw new HTTPStatusError(message, response.status);
    }

    return data satisfies PermissionUpdateResponse;
  }

  return useMutation({
    mutationFn: updateData,
    onSuccess: () => {
      // 권한 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
    throwOnError: () => {
      return false;
    },
  });
}
