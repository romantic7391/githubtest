import { useQuery } from '@tanstack/react-query';
import type { Permission, PermissionResponse } from '@/types/permission/permission';
import { isJsonResponse } from '@/lib/util/common.util';
import { HTTPStatusError } from '@/lib/common.error';

export default function usePermission({ permissionNo }: { permissionNo: Permission['permissionNo'] }) {
  async function fetchData(): Promise<PermissionResponse> {
    const requestUrl = new URL(`/api/permission-admin/permission/${permissionNo}`, window.location.origin);
    const response = await fetch(requestUrl, { method: 'GET' });
    if (!isJsonResponse(response)) {
      throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');
    }

    const { success, message, data } = await response.json();

    if (!success) {
      throw new HTTPStatusError(message, response.status);
    }

    return data satisfies PermissionResponse;
  }

  return useQuery({
    queryKey: ['permission', permissionNo],
    retry: false,
    staleTime: 0,
    gcTime: 0,
    queryFn: fetchData,
    throwOnError: () => {
      return true;
    },
  });
}
