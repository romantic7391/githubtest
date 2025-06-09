import { HTTPMethod } from '@/types/common';

interface PermissionMapping {
  path: string;
  method: HTTPMethod;
  permissions: string[];
  params?: {
    schoolNo?: string; // URL 파라미터에서 schoolNo를 가져올 위치
  };
}

export const permissionMappings: PermissionMapping[] = [
  // 학교 관련 API
  {
    path: '/api/areas/[area]/schools/[schoolNo]',
    method: 'GET',
    permissions: ['학교_조회'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
  {
    path: '/api/areas/[area]/schools/[schoolNo]',
    method: 'PUT',
    permissions: ['학교_조회', '학교_수정'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
  {
    path: '/api/areas/[area]/schools/[schoolNo]',
    method: 'DELETE',
    permissions: ['학교_조회', '학교_삭제'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
  {
    path: '/api/areas/[area]/schools',
    method: 'POST',
    permissions: ['학교_생성'],
  },
  // 디바이스 관련 API 추가
  {
    path: '/api/areas/[area]/schools/[schoolNo]/devices/[mac]',
    method: 'PUT',
    permissions: ['디바이스_수정'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
  {
    path: '/api/areas/[area]/schools/[schoolNo]/devices/[mac]',
    method: 'DELETE',
    permissions: ['디바이스_삭제'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
  {
    path: '/api/areas/[area]/schools/[schoolNo]/devices/[mac]',
    method: 'GET',
    permissions: ['디바이스_조회'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
  {
    path: '/api/areas/[area]/schools/[schoolNo]/devices',
    method: 'POST',
    permissions: ['디바이스_생성'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
];
