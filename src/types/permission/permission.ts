import { z } from 'zod';
import { baseApiResponseSchema, paginationSchema } from '../common';

/**
 * 권한 기본 스키마
 */
export const permissionSchema = z.object({
  permission_no: z.number(),
  name: z.string().min(1, '권한 이름은 필수입니다.').max(50, '권한 이름은 50자를 초과할 수 없습니다.'),
  description: z.string().nullable(),
  defaultExtraCondition: z.string().nullable(),
  defaultExtraLimit: z.string().nullable(),
});

export const groupSchema = z.object({
  group_no: z.number(),
  name: z.string().min(1, '그룹 이름은 필수입니다.').max(50, '그룹 이름은 50자를 초과할 수 없습니다.'),
  school_no: z.number().nullable(),
  parent_group_no: z.number().nullable(),
});

export const managerGroupSchema = z.object({
  group_no: z.number(),
  no: z.number(),
});

export const groupPermissionSchema = z.object({
  group_no: z.number(),
  permission_no: z.number(),
  is_allowed: z.enum(['Y', 'N']).nullable(),
  override: z.enum(['Y', 'N']).nullable(),
  extra_condition: z.string().nullable(),
  extra_limit: z.string().nullable(),
});

/**
 * 권한 생성 스키마
 */
export const createPermissionDtoSchema = z.object({
  name: z.string().min(1, '권한 이름은 필수입니다.').max(50, '권한 이름은 50자를 초과할 수 없습니다.'),
  description: z.string().nullable(),
  defaultExtraCondition: z.string().nullable(),
  defaultExtraLimit: z.string().nullable(),
});

/**
 * 권한 수정 스키마
 */
export const updatePermissionDtoSchema = createPermissionDtoSchema.extend({
  permission_no: z.number().min(1, '권한 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
});

/**
 * 권한 필터 스키마
 */
export const findPermissionDtoSchema = z.object({
  permission_no: z.number().min(1, '권한 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
});

export const findPermissionsDtoSchema = z.object({
  pagination: paginationSchema,
  filters: z
    .object({
      name: z.string().optional(),
    })
    .optional(),
});

// API 요청 스키마
export const createPermissionRequestSchema = createPermissionDtoSchema;
export const updatePermissionRequestSchema = updatePermissionDtoSchema;
export const permissionListRequestSchema = z.object({
  name: z
    .string()
    .max(50, '검색어는 50자를 초과할 수 없습니다.')
    .regex(/^[가-힣a-zA-Z0-9_\s-]*$/, '검색어는 한글, 영문, 숫자, 언더스코어, 하이픈, 공백만 사용할 수 있습니다.')
    .optional(),
});

// API 응답 스키마
export const permissionResponseSchema = permissionSchema;

export const permissionListResponseSchema = z.object({
  permissions: z.array(permissionSchema),
  pagination: paginationSchema,
});

export const permissionCreateResponseSchema = z.object({
  permissionNo: z.number(),
});

export const permissionUpdateResponseSchema = permissionCreateResponseSchema;

export const permissionDeleteResponseSchema = z.object({
  permissionNo: z.number(),
});

// API 응답 래퍼 스키마
export const permissionListApiResponseSchema = baseApiResponseSchema.extend({
  data: permissionListResponseSchema,
});

export const permissionCreateApiResponseSchema = baseApiResponseSchema.extend({
  data: permissionCreateResponseSchema,
});

export const permissionUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: permissionUpdateResponseSchema,
});

export const permissionDeleteApiResponseSchema = baseApiResponseSchema.extend({
  data: permissionDeleteResponseSchema,
});

export const permissionCreateOrUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: permissionCreateResponseSchema,
});

// 라우트 파라미터 타입
export const permissionRouteParamsSchema = z.object({
  params: z.promise(
    z.object({
      permissionNo: z.string(),
    }),
  ),
});

// 타입 export
export type Permission = z.infer<typeof permissionSchema>;
export type Group = z.infer<typeof groupSchema>;
export type ManagerGroup = z.infer<typeof managerGroupSchema>;
export type GroupPermission = z.infer<typeof groupPermissionSchema>;
export type CreatePermissionDto = z.infer<typeof createPermissionDtoSchema>;
export type UpdatePermissionDto = z.infer<typeof updatePermissionDtoSchema>;
export type FindPermissionDto = z.infer<typeof findPermissionDtoSchema>;
export type FindPermissionsDto = z.infer<typeof findPermissionsDtoSchema>;
export type CreatePermissionRequest = z.infer<typeof createPermissionRequestSchema>;
export type UpdatePermissionRequest = z.infer<typeof updatePermissionRequestSchema>;
export type PermissionListRequest = z.infer<typeof permissionListRequestSchema>;
export type PermissionResponse = z.infer<typeof permissionResponseSchema>;
export type PermissionListResponse = z.infer<typeof permissionListResponseSchema>;
export type PermissionCreateResponse = z.infer<typeof permissionCreateResponseSchema>;
export type PermissionUpdateResponse = z.infer<typeof permissionUpdateResponseSchema>;
export type PermissionDeleteResponse = z.infer<typeof permissionDeleteResponseSchema>;
export type PermissionRouteParams = z.infer<typeof permissionRouteParamsSchema>;
