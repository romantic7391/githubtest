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
  group_no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  school_no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(),
  name: z.string().max(20).optional(),
  parent_group_no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(),
  // created: datetimeSchema.nullable(),
});

/**
 * 권한
 */
export const permissionSchema = z.object({
  permission_no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  name: z.string().min(1, '권한 이름은 필수입니다.').max(50),
  description: z.string().max(200).nullable(),
  default_extra_condition: z.string().max(50).nullable(),
  default_extra_limit: z.string().max(50).nullable(),
  // created: datetimeSchema.nullable(),
});

/**
 * 그룹 권한
 */
export const groupPermissionSchema = z.object({
  group_no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  permission_no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  is_allowed: z.enum(['Y', 'N']).nullable(),
  override: z.enum(['Y', 'N']).nullable(),
  extra_condition: z.string().nullable(),
  extra_limit: z.string().max(50).nullable(),
  // created: datetimeSchema.nullable(),
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
export const createPermissionSchema = z.object({
  name: z.string().min(1, '권한 이름은 필수입니다.').max(20),
  description: z.string().max(50).nullable(),
  default_extra_condition: z.string().max(50).nullable(),
  default_extra_limit: z.string().max(50).nullable(),
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
    name: z.string().min(1).max(50),
    description: z.string().max(200).nullable(),
  }),
});

/**
 * 그룹 권한 생성 스키마
 */
export const createGroupPermissionSchema = z.object({
  group_no: z.number().min(1, '그룹 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
  permission_no: z.number().min(1, '권한 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
  is_allowed: z.enum(['Y', 'N']).nullable(),
  override: z.enum(['Y', 'N']).nullable(),
  extra_condition: z.string().max(50).nullable(),
  extra_limit: z.string().max(50).nullable(),
});

/**
 * 그룹 권한 수정 스키마
 */
export const updateGroupPermissionSchema = createGroupPermissionSchema;

export const groupPermissionApiResponseSchema = baseApiResponseSchema.extend({
  data: groupPermissionSchema,
});

export const groupPermissionsApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupPermissions: groupPermissionSchema.array(),
    pagination: paginationSchema,
  }),
});

export const groupPermissionCreateOrUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    group_no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
    permission_no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
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

export const managerGroupsApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    managerGroups: managerGroupSchema.array(),
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
