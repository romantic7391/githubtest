import { z } from 'zod';
import { baseApiResponseSchema, paginationSchema } from '../common';

/**
 * 그룹 권한 기본 스키마
 */
export const groupPermissionSchema = z.object({
  groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  permissionNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  isAllowed: z.enum(['Y', 'N']).nullable(),
  override: z.enum(['Y', 'N']).nullable(),
  extraCondition: z.string().max(50).nullable(),
  extraLimit: z.string().max(50).nullable(),
});

/**
 * 그룹 권한 상세 조회 스키마
 */
export const groupPermissionDetailSchema = z.object({
  groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  groupName: z.string(),
  parentGroupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable(),
  parentGroupName: z.string().nullable(),
  permissionNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  permissionName: z.string(),
  permissionDescription: z.string().nullable(),
  isAllowed: z.enum(['Y', 'N']).nullable(),
  override: z.enum(['Y', 'N']).nullable(),
  extraCondition: z.string().nullable(),
  extraLimit: z.string().nullable(),
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

/**
 * 그룹 권한 필터 스키마
 */
export const groupPermissionFilterSchema = z.object({
  groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
  permissionNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
});

// API 응답 스키마
export const groupPermissionApiResponseSchema = baseApiResponseSchema.extend({
  data: groupPermissionSchema,
});

export const groupPermissionsApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupPermissions: groupPermissionDetailSchema.array(),
    pagination: paginationSchema,
  }),
});

export const groupPermissionCreateOrUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
    permissionNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  }),
});

// DTO 스키마
export const findGroupPermissionDtoSchema = z.object({
  groupNo: z.number().min(1, '그룹 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
  permissionNo: z.number().min(1, '권한 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
});

export const insertGroupPermissionDtoSchema = groupPermissionSchema;

export const updateGroupPermissionDtoSchema = updateGroupPermissionSchema;

export const deleteGroupPermissionDtoSchema = groupPermissionSchema.pick({
  groupNo: true,
  permissionNo: true,
});

// 타입 export
export type GroupPermission = z.infer<typeof groupPermissionSchema>;
export type GroupPermissionDetail = z.infer<typeof groupPermissionDetailSchema>;
export type CreateGroupPermission = z.infer<typeof createGroupPermissionSchema>;
export type UpdateGroupPermission = z.infer<typeof updateGroupPermissionSchema>;
export type GroupPermissionFilter = z.infer<typeof groupPermissionFilterSchema>;
export type GroupPermissionCreateOrUpdateResponse = z.infer<
  typeof groupPermissionCreateOrUpdateApiResponseSchema
>['data'];

// DTO 타입 export
export type FindGroupPermissionDto = z.infer<typeof findGroupPermissionDtoSchema>;
export type InsertGroupPermissionDto = z.infer<typeof insertGroupPermissionDtoSchema>;
export type UpdateGroupPermissionDto = z.infer<typeof updateGroupPermissionDtoSchema>;
export type DeleteGroupPermissionDto = z.infer<typeof deleteGroupPermissionDtoSchema>;
