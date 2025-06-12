import { z } from 'zod';
import { baseApiResponseSchema, paginationSchema } from './common';

/**
 * 관리자
 */
export const managerSchema = z.object({
  no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  school_no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  login_id: z.string().max(16),
  name: z.string().max(20),
  passwd: z.string().nullable(),
  // created: datetimeSchema.nullable(),
});

/**
 * 관리자 그룹
 */
export const managerGroupSchema = z.object({
  groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  // created: datetimeSchema.nullable(),
});

/**
 * 그룹
 */
export const groupSchema = z.object({
  group_no: z.number(),
  name: z.string().min(1, '그룹 이름은 필수입니다.').max(50, '그룹 이름은 50자를 초과할 수 없습니다.'),
  school_no: z.number().nullable(),
  parent_group_no: z.number().nullable(),
  school_name: z.string().nullable(),
  parent_group_name: z.string().nullable(),
  created: z.string().optional(),
  updated: z.string().optional(),
});

/**
 * 권한
 */
export const permissionSchema = z.object({
  permission_no: z.number(),
  name: z.string().min(1, '권한 이름은 필수입니다.').max(50, '권한 이름은 50자를 초과할 수 없습니다.'),
  description: z.string().nullable(),
  default_extra_condition: z.string().nullable(),
  default_extra_limit: z.string().nullable(),
});

/**
 * 그룹 권한
 */
export const groupPermissionSchema = z.object({
  groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  permissionNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  isAllowed: z.enum(['Y', 'N']).nullable(),
  override: z.enum(['Y', 'N']).nullable(),
  extraCondition: z.string().max(50).nullable(),
  extraLimit: z.string().max(50).nullable(),
  // created: datetimeSchema.nullable(),
});

/**
 * 그룹 권한 상세 정보 (조회용)
 */
export const groupPermissionDetailSchema = groupPermissionSchema.extend({
  groupName: z.string(),
  parentGroupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(),
  parentGroupName: z.string().nullable(),
  permissionName: z.string(),
  permissionDescription: z.string(),
});

/**
 * 그룹 생성 스키마
 */
export const createGroupSchema = z.object({
  name: z.string().min(1, '그룹 이름은 필수입니다.').max(20),
  schoolNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(),
  parentGroupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(),
});

/**
 * 그룹 수정 스키마
 */
export const updateGroupSchema = createGroupSchema.extend({
  groupNo: z.number().min(1, '그룹 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
});

/**
 * 권한 생성 스키마
 */
export const createPermissionSchema = permissionSchema.pick({
  name: true,
  description: true,
  default_extra_condition: true,
  default_extra_limit: true,
});

/**
 * 권한 수정 스키마
 */
export const updatePermissionSchema = createPermissionSchema.extend({
  permission_no: z.number().min(1, '권한 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
});

/**
 * 공통 컨텍스트
 */
export const commonContextSchema = z.object({
  manager_no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  ip: z.string(),
  user_agent: z.string(),
});

export type CommonContext = z.infer<typeof commonContextSchema>;

/**
 * 학교 계층 구조
 */
export const schoolHierarchySchema = z.object({
  current: z.object({
    schoolNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
    name: z.string(),
    area: z.string(),
  }),
  upper: z
    .object({
      schoolNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
      name: z.string(),
      area: z.string(),
    })
    .optional(),
  upperUpper: z
    .object({
      schoolNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
      name: z.string(),
      area: z.string(),
    })
    .optional(),
  lower: z
    .array(
      z.object({
        schoolNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
        name: z.string(),
        area: z.string(),
      }),
    )
    .optional(),
});

/**
 * 권한 체크 결과
 */
export const permissionCheckResultSchema = z.object({
  allowed: z.enum(['Y', 'N']),
  override: z.enum(['Y', 'N']).nullable(),
  extraCondition: z.string().nullable(),
});

// API 응답 스키마
export const groupsApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groups: groupSchema.array(),
    pagination: paginationSchema,
  }),
});

export const groupApiResponseSchema = baseApiResponseSchema.extend({
  data: groupSchema,
});

export const groupCreateOrUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  }),
});

export const permissionApiResponseSchema = baseApiResponseSchema.extend({
  data: permissionSchema,
});

export const permissionsApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    permissions: permissionSchema.array(),
    pagination: paginationSchema,
  }),
});

export const permissionCreateOrUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    permissionNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  }),
});

/**
 * 그룹 권한 필터 스키마
 */
export const groupPermissionFilterSchema = z.object({
  groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
  permissionNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
});

/**
 * 그룹 권한 생성 스키마
 */
export const createGroupPermissionSchema = z.object({
  groupNo: z.number().min(1, '그룹 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
  permissionNo: z.number().min(1, '권한 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
  isAllowed: z.enum(['Y', 'N']).nullable(),
  override: z.enum(['Y', 'N']).nullable(),
  extraCondition: z.string().max(50).nullable(),
  extraLimit: z.string().max(50).nullable(),
});

/**
 * 그룹 권한 수정 스키마
 */
export const updateGroupPermissionSchema = z.object({
  groupNo: z.number().min(1, '그룹 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
  permissionNo: z.number().min(1, '권한 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
  isAllowed: z.enum(['Y', 'N']).nullable(),
  override: z.enum(['Y', 'N']).nullable(),
  extraCondition: z.string().max(50).nullable(),
  extraLimit: z.string().max(50).nullable(),
  originalGroupNo: z.number().min(1, '원래 그룹 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
  originalPermissionNo: z.number().min(1, '원래 권한 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
});

export const groupPermissionApiResponseSchema = baseApiResponseSchema.extend({
  data: groupPermissionSchema,
});

export const groupPermissionsApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupPermissions: groupPermissionDetailSchema.array(),
    pagination: paginationSchema,
  }),
});

/**
 * 그룹 권한 생성/수정 API 응답
 */
export const groupPermissionCreateOrUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
    permissionNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  }),
});

/**
 * 관리자 그룹 생성 스키마
 */
export const createManagerGroupSchema = z.object({
  groupNo: z.number().min(1, '그룹 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
  no: z.number().min(1, '관리자 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
});

/**
 * 관리자 그룹 수정 스키마
 */
export const updateManagerGroupSchema = createManagerGroupSchema.extend({
  originalNo: z.number().min(1, '원래 관리자 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
  originalGroupNo: z.number().min(1, '원래 그룹 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
});

export const managerGroupApiResponseSchema = baseApiResponseSchema.extend({
  data: managerGroupSchema,
});

/**
 * 매니저 그룹 상세 조회 스키마
 */
export const managerGroupDetailSchema = z.object({
  managerNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  managerName: z.string(),
  schoolNo: z.number().nullable(),
  schoolName: z.string().nullable(),
  groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  groupName: z.string(),
  permissionNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  permissionName: z.string(),
  isAllowed: z.string().nullable(),
  override: z.string().nullable(),
  extraCondition: z.string().nullable(),
  extraLimit: z.number().nullable(),
});

export const managerGroupsApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    managerGroups: managerGroupDetailSchema.array(),
    pagination: paginationSchema,
  }),
});

export const managerGroupCreateOrUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
    no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  }),
});

export type ManagerGroup = z.infer<typeof managerGroupSchema>;
export type Group = z.infer<typeof groupSchema>;
export type GroupPermission = z.infer<typeof groupPermissionSchema>;
export type CreateGroup = z.infer<typeof createGroupSchema>;
export type UpdateGroup = z.infer<typeof updateGroupSchema>;
export type CreateGroupPermission = z.infer<typeof createGroupPermissionSchema>;
export type UpdateGroupPermission = z.infer<typeof updateGroupPermissionSchema>;
export type CreateManagerGroup = z.infer<typeof createManagerGroupSchema>;
export type UpdateManagerGroup = z.infer<typeof updateManagerGroupSchema>;
export type ManagerGroupCreateOrUpdateResponse = z.infer<typeof managerGroupCreateOrUpdateApiResponseSchema>['data'];
export type Permission = z.infer<typeof permissionSchema>;
export type PermissionCreateOrUpdateResponse = z.infer<typeof permissionCreateOrUpdateApiResponseSchema>['data'];

/**
 * 권한 검색 필터 스키마
 */
export const permissionFilterSchema = z.object({
  name: z
    .string()
    .max(50, '검색어는 50자를 초과할 수 없습니다.')
    .regex(/^[가-힣a-zA-Z0-9_-]*$/, '검색어는 한글, 영문, 숫자, 언더스코어, 하이픈만 사용할 수 있습니다.')
    .optional(),
});

export type PermissionFilter = z.infer<typeof permissionFilterSchema>;

/**
 * 라우트 파라미터 타입
 */
export const routeParamsSchema = z.object({
  params: z.promise(
    z.object({
      groupNo: z.string(),
    }),
  ),
});

export const permissionRouteParamsSchema = z.object({
  params: z.promise(
    z.object({
      permissionNo: z.string(),
    }),
  ),
});

export type RouteParams = z.infer<typeof routeParamsSchema>;
export type PermissionRouteParams = z.infer<typeof permissionRouteParamsSchema>;

// 2. API 요청 스키마
export const createPermissionRequestSchema = z.object({
  name: z.string().min(1, '권한 이름은 필수입니다.').max(50, '권한 이름은 50자를 초과할 수 없습니다.'),
  description: z.string().nullable(),
  defaultExtraCondition: z.string().nullable(),
  defaultExtraLimit: z.string().nullable(),
});

export const updatePermissionRequestSchema = createPermissionRequestSchema.extend({
  permission_no: z.number().min(1, '권한 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
});

export const permissionListRequestSchema = z.object({
  name: z
    .string()
    .max(50, '검색어는 50자를 초과할 수 없습니다.')
    .regex(/^[가-힣a-zA-Z0-9_\s-]*$/, '검색어는 한글, 영문, 숫자, 언더스코어, 하이픈, 공백만 사용할 수 있습니다.')
    .optional(),
});

// 3. API 응답 스키마
export const permissionResponseSchema = permissionSchema;

export const permissionListResponseSchema = z.object({
  permissions: z.array(
    z.object({
      permissionNo: z.number(),
      name: z.string(),
      description: z.string().nullable(),
      defaultExtraCondition: z.string().nullable(),
      defaultExtraLimit: z.string().nullable(),
    }),
  ),
  pagination: paginationSchema,
});

export const permissionCreateResponseSchema = z.object({});

export const permissionUpdateResponseSchema = permissionCreateResponseSchema;

export const permissionDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    permissionNo: z.number(),
  }),
});

// 4. API 응답 래퍼 스키마
export const permissionListApiResponseSchema = baseApiResponseSchema.extend({
  data: permissionListResponseSchema,
});

export const permissionCreateApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    permissionNo: z.number(),
  }),
});

export const permissionUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: permissionUpdateResponseSchema,
});

export const permissionDeleteApiResponseSchema = baseApiResponseSchema.extend({
  data: permissionDeleteResponseSchema,
});

// 5. 타입 export
export type CreatePermissionRequest = z.infer<typeof createPermissionRequestSchema>;
export type UpdatePermissionRequest = z.infer<typeof updatePermissionRequestSchema>;
export type PermissionListRequest = z.infer<typeof permissionListRequestSchema>;
export type PermissionResponse = z.infer<typeof permissionResponseSchema>;
export type PermissionListResponse = z.infer<typeof permissionListResponseSchema>;
export type PermissionCreateResponse = z.infer<typeof permissionCreateResponseSchema>;
export type PermissionUpdateResponse = z.infer<typeof permissionUpdateResponseSchema>;
export type PermissionDeleteResponse = z.infer<typeof permissionDeleteResponseSchema>;

export const permissionUpdateRequestSchema = z.object({
  name: z.string().min(1, '권한 이름은 필수입니다.').max(50, '권한 이름은 50자를 초과할 수 없습니다.'),
  description: z.string().nullable(),
  defaultExtraCondition: z.string().nullable(),
  defaultExtraLimit: z.string().nullable(),
});

// 그룹 관련 타입
export type GroupRouteParams = {
  params: {
    groupNo: string;
  };
};

export const groupUpdateRequestSchema = z.object({
  name: z.string().min(1, '그룹 이름은 필수입니다.').max(50, '그룹 이름은 50자를 초과할 수 없습니다.'),
  schoolNo: z.number().nullable(),
  parentGroupNo: z.number().nullable(),
});

export const groupDeleteApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupNo: z.number(),
  }),
});

// 그룹 관련 스키마
export const createGroupRequestSchema = z.object({
  name: z.string().min(1, '그룹 이름은 필수입니다.').max(50, '그룹 이름은 50자를 초과할 수 없습니다.'),
  schoolNo: z.number().nullable(),
  parentGroupNo: z.number().nullable(),
});

export const groupListRequestSchema = z.object({
  name: z.string().optional(),
  schoolNo: z.number().nullable().optional(),
  groupNo: z.number().optional(),
});

export const groupListApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groups: z.array(groupSchema),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  }),
});

export const groupCreateApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupNo: z.number(),
  }),
});

/**
 * 그룹 수정 응답 스키마
 */
export const groupUpdateResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupNo: z.number(),
  }),
});

/**
 * 그룹 삭제 응답 스키마
 */
export const groupDeleteResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupNo: z.number(),
  }),
});

// 매니저 그룹 목록 조회 스키마
export const managerGroupListRequestSchema = z.object({
  groupNo: z.number().optional(),
  schoolNo: z.number().optional(),
});
