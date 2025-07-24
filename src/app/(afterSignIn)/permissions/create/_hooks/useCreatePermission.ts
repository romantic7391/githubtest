import { isJsonResponse } from '@/lib/util/common.util';
import { BaseApiResponse } from '@/types/common';
import {
  CreatePermissionDto,
  createPermissionDtoSchema,
  PermissionCreateResponse,
} from '@/types/permission/permission';
import { useMutation } from '@tanstack/react-query';

export default function useCreatePermission() {
  async function mutationFn(permission: CreatePermissionDto) {
    const requestUrl = new URL('/api/permission-admin/permission', window.location.origin);
    const parsed = createPermissionDtoSchema.safeParse(permission);
    if (!parsed.success) {
      throw parsed.error;
    }

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed.data),
    });

    if (!isJsonResponse(response)) {
      throw new Error('서버가 JSON 응답을 반환하지 않았습니다.');
    }

    const { success, message, data } = await response.json();
    if (!success) {
      throw new Error(message);
    }

    return data satisfies BaseApiResponse & { data: PermissionCreateResponse }['data'];
  }

  return useMutation({
    mutationFn,
    throwOnError: false,
  });
}
