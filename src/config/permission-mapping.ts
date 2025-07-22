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
  // 지역 관련 API
  {
    path: '/api/areas',
    method: 'GET',
    permissions: ['지역_조회'],
  },
  {
    path: '/api/areas/create',
    method: 'POST',
    permissions: ['지역_생성'],
  },
  {
    path: '/api/areas/[area]',
    method: 'GET',
    permissions: ['특정정지역_조회'],
  },
  {
    path: '/api/areas/[area]',
    method: 'PUT',
    permissions: ['지역_수정'],
  },
  {
    path: '/api/areas/[area]',
    method: 'DELETE',
    permissions: ['지역_삭제'],
  },
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
    permissions: ['학교_수정'],
    params: {
      schoolNo: 'schoolNo',
    },
  },

  {
    path: '/api/areas/[area]/schools/[schoolNo]',
    method: 'DELETE',
    permissions: ['학교_삭제'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
  {
    path: '/api/areas/[area]/schools/create',
    method: 'POST',
    permissions: ['학교_생성'],
  },
  {
    path: '/api/areas/[area]/schools',
    method: 'GET',
    permissions: ['학교_조회'],
  },

  // 센서 관련 API 추가
  {
    path: '/api/areas/[area]/schools/[schoolNo]/devices/[mac]',
    method: 'PUT',
    permissions: ['센서_수정'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
  {
    path: '/api/areas/[area]/schools/[schoolNo]/devices/[mac]',
    method: 'DELETE',
    permissions: ['센서_삭제'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
  {
    path: '/api/areas/[area]/schools/[schoolNo]/devices/[mac]',
    method: 'GET',
    permissions: ['센서_조회'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
  {
    path: '/api/areas/[area]/schools/[schoolNo]/devices/create',
    method: 'POST',
    permissions: ['센서_생성'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
  {
    path: '/api/areas/[area]/schools/[schoolNo]/devices',
    method: 'GET',
    permissions: ['센서_목록_조회'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
  // 권한 관리 API
  {
    path: '/api/permission-admin/permission',
    method: 'GET',
    permissions: ['권한_조회'],
  },
  {
    path: '/api/permission-admin/permission',
    method: 'POST',
    permissions: ['권한_생성'],
  },
  {
    path: '/api/permission-admin/group',
    method: 'GET',
    permissions: ['그룹_조회'],
  },
  {
    path: '/api/permission-admin/group',
    method: 'POST',
    permissions: ['그룹_생성'],
  },
  {
    path: '/api/permission-admin/group-permission',
    method: 'GET',
    permissions: ['그룹권한_조회'],
  },
  {
    path: '/api/permission-admin/group-permission',
    method: 'POST',
    permissions: ['그룹권한_생성'],
  },
  {
    path: '/api/permission-admin/manager-group',
    method: 'GET',
    permissions: ['관리자그룹_조회'],
  },
  {
    path: '/api/permission-admin/manager-group',
    method: 'POST',
    permissions: ['관리자그룹_생성'],
  },
];
