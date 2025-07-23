import { useQuery } from '@tanstack/react-query';
import { GroupPermissionDetail } from '@/types/permission/group-permission';
import { HTTPStatusError } from '@/lib/common.error';
import { isJsonResponse } from '@/lib/util/common.util';
import { paginationSchema } from '@/types/common';

interface UseGroupPermissionsProps {
  schoolNo: number;
  groupNo: number;
}

interface GroupPermissionsResponse {
  groupPermissions: GroupPermissionDetail[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function useGroupPermissions({ schoolNo, groupNo }: UseGroupPermissionsProps) {
  function getInitialData() {
    return {
      groupPermissions: [],
      pagination: paginationSchema.parse({}),
    };
  }

  async function fetchGroupPermissions(): Promise<GroupPermissionsResponse> {
    const requestUrl = new URL('/api/permission-admin/group-permission', window.location.origin);
    requestUrl.searchParams.set('page', '1');
    requestUrl.searchParams.set('pageSize', '1000'); // 모든 그룹 권한을 가져오기 위해 큰 값 설정
    requestUrl.searchParams.set('groupNo', groupNo.toString());
    requestUrl.searchParams.set('schoolNo', schoolNo.toString());

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!isJsonResponse(response)) {
      throw new HTTPStatusError('서버가 JSON 응답을 반환하지 않았습니다.', response.status);
    }

    const { success, data, message } = await response.json();

    if (response.status === 404) {
      return getInitialData();
    }

    if (!success) {
      throw new HTTPStatusError(message, response.status);
    }

    return data;
  }

  return useQuery({
    queryKey: ['groupPermissions', schoolNo, groupNo],
    queryFn: fetchGroupPermissions,
    staleTime: 5 * 60 * 1000, // 5분
    enabled: !!groupNo, // groupNo가 있을 때만 실행
  });
}
