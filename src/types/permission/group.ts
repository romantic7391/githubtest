import { z } from 'zod';
import { baseApiResponseSchema, paginationSchema } from '../common';

/**
 * 그룹 기본 스키마
 */
export const groupSchema = z.object({
  groupNo: z.number(),
  name: z.string().min(1, '그룹 이름은 필수입니다.').max(50, '그룹 이름은 50자를 초과할 수 없습니다.'),
  schoolNo: z.number().nullable(),
  parentGroupNo: z.number().nullable(),
  schoolName: z.string().nullable(),
  parentGroupName: z.string().nullable(),
  created: z.string().optional(),
  updated: z.string().optional(),
});

/**
 * 그룹 생성 스키마
 */
export const createGroupSchema = z.object({
  name: z.string().min(1, '그룹 이름은 필수입니다.').max(50, '그룹 이름은 50자를 초과할 수 없습니다.'),
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
 * 그룹 필터 스키마
 */
export const groupFilterSchema = z.object({
  name: z.string().optional(),
  schoolNo: z.number().nullable().optional(),
  groupNo: z.number().optional(),
});

// API 응답 스키마
export const groupApiResponseSchema = baseApiResponseSchema.extend({
  data: groupSchema,
});

export const groupsApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groups: groupSchema.array(),
    pagination: paginationSchema,
  }),
});

export const groupCreateOrUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  }),
});

export const groupDeleteApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    groupNo: z.number(),
  }),
});

// DTO 스키마
export const findGroupsDtoSchema = z.object({
  pagination: paginationSchema,
  filters: groupFilterSchema.optional(),
});

export const insertGroupDtoSchema = z.object({
  name: z.string().min(1, '그룹 이름은 필수입니다.').max(50, '그룹 이름은 50자를 초과할 수 없습니다.'),
  school_no: z.number().nullable(),
  parent_group_no: z.number().nullable(),
});

export const updateGroupDtoSchema = groupSchema;

export const deleteGroupDtoSchema = z.object({
  groupNo: z.number().min(1, '그룹 번호는 필수입니다.').max(Number.MAX_SAFE_INTEGER),
});

export const findGroupDtoSchema = deleteGroupDtoSchema;

export const checkGroupExistsDtoSchema = deleteGroupDtoSchema;

export const checkGroupDuplicateDtoSchema = z.object({
  name: z.string().min(1, '그룹 이름은 필수입니다.').max(50, '그룹 이름은 50자를 초과할 수 없습니다.'),
  schoolNo: z.number().nullable(),
  groupNo: z.number().optional(),
});

// 타입 export
export type Group = z.infer<typeof groupSchema>;
export type CreateGroup = z.infer<typeof createGroupSchema>;
export type UpdateGroup = z.infer<typeof updateGroupSchema>;
export type GroupFilter = z.infer<typeof groupFilterSchema>;

// DTO 타입 export
export type FindGroupsDto = z.infer<typeof findGroupsDtoSchema>;
export type InsertGroupDto = z.infer<typeof insertGroupDtoSchema>;
export type UpdateGroupDto = z.infer<typeof updateGroupDtoSchema>;
export type DeleteGroupDto = z.infer<typeof deleteGroupDtoSchema>;
export type FindGroupDto = z.infer<typeof findGroupDtoSchema>;
export type CheckGroupExistsDto = z.infer<typeof checkGroupExistsDtoSchema>;
export type CheckGroupDuplicateDto = z.infer<typeof checkGroupDuplicateDtoSchema>;

/**
 * 라우트 파라미터 타입
 */
export const groupRouteParamsSchema = z.object({
  params: z.promise(
    z.object({
      groupNo: z.string(),
    }),
  ),
});

export type GroupRouteParams = z.infer<typeof groupRouteParamsSchema>;

/**
 * 그룹 수정 요청 스키마
 */
export const groupUpdateRequestSchema = z.object({
  name: z.string().min(1, '그룹 이름은 필수입니다.').max(50, '그룹 이름은 50자를 초과할 수 없습니다.').optional(),
  schoolNo: z.number().nullable().optional(),
  parentGroupNo: z.number().nullable().optional(),
});
