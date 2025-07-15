import { z } from 'zod';
import { baseApiResponseSchema, paginationSchema } from '../common';

/**
 * 관리자 그룹 기본 스키마
 */
export const managerGroupSchema = z.object({
  groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  no: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
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

/**
 * 매니저 그룹 목록 조회 스키마
 */
export const managerGroupListRequestSchema = z.object({
  groupNo: z.number().optional(),
  schoolNo: z.number().optional(),
  managerNo: z.number().optional(),
});

/**
 * 매니저 그룹 조회 파라미터 스키마
 */
export const managerGroupParamsSchema = z.object({
  managerNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  groupNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
});

// API 응답 스키마
export const managerGroupApiResponseSchema = baseApiResponseSchema.extend({
  data: managerGroupSchema,
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

/**
 * 매니저 그룹 목록 조회 DTO
 */
export interface FindManagerGroupsDto {
  managerNo: number;
  filters?: {
    groupNo?: number;
    schoolNo?: number;
    managerNo?: number;
  };
}

// DTO 스키마
export const findManagerGroupDtoSchema = managerGroupSchema.pick({
  no: true,
  groupNo: true,
});

export const insertManagerGroupDtoSchema = managerGroupSchema;

export const updateManagerGroupDtoSchema = updateManagerGroupSchema;

export const deleteManagerGroupDtoSchema = managerGroupSchema.pick({
  no: true,
  groupNo: true,
});

// 타입 export
export type ManagerGroup = z.infer<typeof managerGroupSchema>;
export type ManagerGroupDetail = z.infer<typeof managerGroupDetailSchema>;
export type CreateManagerGroup = z.infer<typeof createManagerGroupSchema>;
export type UpdateManagerGroup = z.infer<typeof updateManagerGroupSchema>;
export type ManagerGroupListRequest = z.infer<typeof managerGroupListRequestSchema>;
export type ManagerGroupCreateOrUpdateResponse = z.infer<typeof managerGroupCreateOrUpdateApiResponseSchema>['data'];
export type ManagerGroupParams = z.infer<typeof managerGroupParamsSchema>;

// DTO 타입 export
export type FindManagerGroupDto = z.infer<typeof findManagerGroupDtoSchema>;
export type InsertManagerGroupDto = z.infer<typeof insertManagerGroupDtoSchema>;
export type UpdateManagerGroupDto = z.infer<typeof updateManagerGroupDtoSchema>;
export type DeleteManagerGroupDto = z.infer<typeof deleteManagerGroupDtoSchema>;
