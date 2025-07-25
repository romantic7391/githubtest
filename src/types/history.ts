import { z } from 'zod';
import {
  baseApiResponseSchema,
  datetimeSchema,
  nullToUndefinedObject,
  paginationSchema,
  stringToNumberObject,
} from './common';

// 히스토리 기본 스키마
export const historySchema = z.object({
  managerNo: z.number().nullable(),
  schoolNo: z.number().nullable(),
  ip: z.string().nullable(),
  userAgent: z.string().nullable(),
  actionType: z.enum(['S', 'I', 'U', 'D']),
  targetTable: z.string().nullable(),
  targetId: z.string().nullable(),
  oldValues: z.string().nullable(),
  newValues: z.string().nullable(),
  reason: z.string().nullable(),
});

// 히스토리 메타 정보 스키마
export const logMetaSchema = z.object({
  ip: z.string().nullable(),
  managerNo: z.number(),
  userAgent: z.string().nullable(),
  schoolNo: z.number(),
});

// 히스토리 번호 스키마
export const historyNoSchema = z.object({
  historyNo: z.coerce.number().min(0).max(Number.MAX_SAFE_INTEGER),
});

export const historyWithNoSchema = historySchema.extend({
  historyNo: historyNoSchema.shape.historyNo,
});

export type History = z.infer<typeof historySchema>;
export type LogMeta = z.infer<typeof logMetaSchema>;
export type HistoryNo = z.infer<typeof historyNoSchema>;
export type HistoryWithNo = z.infer<typeof historyWithNoSchema>;

export const selectHistoryDtoSchema = z.object({
  pagination: z.preprocess(stringToNumberObject, paginationSchema),
  filters: z.preprocess(
    nullToUndefinedObject,
    z
      .object({})
      .partial()
      .extend({
        order: z.enum(['asc', 'desc']).default('desc'),
      }),
  ),
});

export type SelectHistoryDto = z.infer<typeof selectHistoryDtoSchema>;

export const historiesApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    histories: historyWithNoSchema.array(),
    pagination: paginationSchema,
  }),
});
export type HistoriesApiResponse = z.infer<typeof historiesApiResponseSchema>;

export const ACTION_TYPE = {
  SELECT: 'S',
  INSERT: 'I',
  UPDATE: 'U',
  DELETE: 'D',
} as const;
export const actionTypeSchema = z.enum([
  ACTION_TYPE.SELECT,
  ACTION_TYPE.INSERT,
  ACTION_TYPE.UPDATE,
  ACTION_TYPE.DELETE,
]);
export type ActionType = z.infer<typeof actionTypeSchema>;

/**
 * 작업 이력 목록 조회 요청 DTO
 */
export const selectHistoriesRequestDto = z.object({
  pagination: z.preprocess(stringToNumberObject, paginationSchema),
  filters: z.preprocess(
    nullToUndefinedObject,
    z
      .object({})
      .partial()
      .extend({
        order: z.enum(['asc', 'desc']).nullish().default('desc'),
      }),
  ),
});
export type SelectHistoriesRequestDto = z.infer<typeof selectHistoriesRequestDto>;

export const selectHistoriesResponseDto = baseApiResponseSchema.extend({
  data: z.object({
    histories: z
      .object({
        // 이력 정보
        historyNo: z.number().positive(),
        ip: z.string().nullable(),
        userAgent: z.string().nullable(),
        actionType: actionTypeSchema,
        targetTable: z.string().nullable(),
        targetId: z.string().nullable(),
        oldValues: z.string().nullable(),
        newValues: z.string().nullable(),
        reason: z.string().nullable(),
        created: datetimeSchema,

        // 학교
        schoolNo: z.number().nonnegative(),
        schoolCode: z.string(),
        schoolName: z.string(),

        // 사용자
        managerNo: z.number().nonnegative().nullable(),
        managerSignInId: z.string().nullable(),
        managerName: z.string().nullable(),
      })
      .array(),
    pagination: paginationSchema,
  }),
});
export type SelectHistoriesResponseDto = z.infer<typeof selectHistoriesResponseDto>;
