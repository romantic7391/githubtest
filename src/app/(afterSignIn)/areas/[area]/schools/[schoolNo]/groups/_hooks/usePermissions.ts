import { useQuery } from '@tanstack/react-query';
import { Permission } from '@/types/permission/permission';

interface UsePermissionsProps {
  schoolNo: number;
}

interface PermissionsResponse {
  permissions: Permission[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function usePermissions({ schoolNo }: UsePermissionsProps) {
  async function fetchPermissions(): Promise<PermissionsResponse> {
    const requestUrl = new URL('/api/permission-admin/permission', window.location.origin);
    requestUrl.searchParams.set('page', '1');
    requestUrl.searchParams.set('pageSize', '1000'); // 모든 권한을 가져오기 위해 큰 값 설정

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('권한 목록을 가져오는데 실패했습니다.');
    }

    const { success, data, message } = await response.json();

    if (!success) {
      throw new Error(message || '권한 목록을 가져오는데 실패했습니다.');
    }

    return data;
  }

  return useQuery({
    queryKey: ['permissions', schoolNo],
    queryFn: fetchPermissions,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
