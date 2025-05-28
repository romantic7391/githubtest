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

  // 학생 관련 API
  {
    path: '/api/areas/[area]/schools/[schoolNo]/students',
    method: 'GET',
    permissions: ['학교_조회', '학생_조회'],
    params: {
      schoolNo: 'schoolNo',
    },
  },

  // 식단 관련 API
  {
    path: '/api/areas/[area]/schools/[schoolNo]/meals',
    method: 'GET',
    permissions: ['학교_조회', '식단_조회'],
    params: {
      schoolNo: 'schoolNo',
    },
  },

  // 공지사항 관련 API
  {
    path: '/api/areas/[area]/schools/[schoolNo]/notices',
    method: 'POST',
    permissions: ['학교_조회', '공지사항_작성'],
    params: {
      schoolNo: 'schoolNo',
    },
  },

  // 통계 관련 API
  {
    path: '/api/areas/[area]/schools/[schoolNo]/statistics',
    method: 'GET',
    permissions: ['학교_조회', '통계_조회'],
    params: {
      schoolNo: 'schoolNo',
    },
  },
];
