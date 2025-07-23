import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Permission } from '@/types/permission/permission';

interface UseUpdateGroupPermissionsProps {
  schoolNo: number;
  groupNo: number;
}

interface UpdateGroupPermissionsParams {
  permissions: Permission[];
  selectedPermissionNos: number[];
}

export default function useUpdateGroupPermissions({ schoolNo, groupNo }: UseUpdateGroupPermissionsProps) {
  const queryClient = useQueryClient();

  async function updateGroupPermissions({ permissions, selectedPermissionNos }: UpdateGroupPermissionsParams) {
    // 현재 그룹이 가진 권한들의 번호 목록
    const currentPermissionNos = permissions.map((p) => p.permissionNo);

    // 추가할 권한들 (새로 선택된 권한들)
    const permissionsToAdd = selectedPermissionNos.filter(
      (permissionNo) => !currentPermissionNos.includes(permissionNo),
    );

    // 삭제할 권한들 (기존에 있지만 새로 선택되지 않은 권한들)
    const permissionsToRemove = currentPermissionNos.filter(
      (permissionNo) => !selectedPermissionNos.includes(permissionNo),
    );

    // 추가할 권한들을 생성
    const addPromises = permissionsToAdd.map((permissionNo) => {
      const requestUrl = new URL('/api/permission-admin/group-permission', window.location.origin);
      const body = JSON.stringify({
        groupNo,
        permissionNo,
        isAllowed: 'Y',
        override: null,
        extraCondition: null,
        extraLimit: null,
      });

      return fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
    });

    // 삭제할 권한들을 삭제
    const removePromises = permissionsToRemove.map((permissionNo) => {
      const requestUrl = new URL('/api/permission-admin/group-permission', window.location.origin);
      const body = JSON.stringify({
        groupNo,
        permissionNo,
      });

      return fetch(requestUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
    });

    // 모든 요청을 병렬로 실행
    const allPromises = [...addPromises, ...removePromises];

    if (allPromises.length === 0) {
      return; // 변경사항이 없으면 아무것도 하지 않음
    }

    const responses = await Promise.all(allPromises);

    // 응답 검증
    for (const response of responses) {
      if (!isJsonResponse(response)) {
        throw new HTTPStatusError('서버가 JSON 응답을 반환하지 않았습니다.', response.status);
      }

      const { success, message } = await response.json();
      if (!success) {
        throw new HTTPStatusError(message, response.status);
      }
    }
  }

  return useMutation({
    mutationFn: updateGroupPermissions,
    onSuccess: () => {
      // 그룹 권한 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['groupPermissions', schoolNo, groupNo] });
    },
  });
}
