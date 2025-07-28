import { z } from 'zod';
import {
  baseApiResponseSchema,
  datetimeSchema,
  nullToUndefinedObject,
  paginationSchema,
  stringToNumberObject,
} from './common';
import { schoolSchema } from './school';
import { managerSchema } from './manager';

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

export const ACTION_TYPE = {
  SELECT: 'S',
  INSERT: 'I',
  UPDATE: 'U',
  DELETE: 'D',
} as const;
export const actionTypeSchema = z.enum(
  [ACTION_TYPE.SELECT, ACTION_TYPE.INSERT, ACTION_TYPE.UPDATE, ACTION_TYPE.DELETE],
  { message: '작업 유형을 잘못 선택하셨습니다.' },
);
export type ActionType = z.infer<typeof actionTypeSchema>;

/**
 * 작업 이력 목록 조회 필터 스키마
 */
export const historyFilterSchema = z
  .object({
    startDate: datetimeSchema.describe('시작 일시'),
    endDate: datetimeSchema.describe('종료 일시'),
    historyNo: z.coerce.number({ message: '이력 번호는 숫자여야 합니다.' }).describe('이력 번호'),
    actionTypes: z
      .preprocess((v) => {
        if (Array.isArray(v)) return v;
        if (typeof v === 'string') return v.split(',');
        return v;
      }, actionTypeSchema.array())
      .default([])
      .describe('작업 유형'),
    targetTables: z
      .preprocess((v) => {
        if (Array.isArray(v)) return v;
        if (typeof v === 'string') return v.split(',');
        return v;
      }, z.string().array())
      .default([])
      .describe('대상 테이블'),
    targetId: z.string().describe('대상 ID'),
    ip: z.string().ip({ version: 'v4', message: 'IP 주소는 IPv4 형식이어야 합니다.' }).describe('IP 주소'),
    userAgent: z.string().describe('User-Agent'),
    schoolName: schoolSchema.shape.sname.describe('학교명'),
    schoolCode: schoolSchema.shape.scode.describe('학교 코드'),
    managerName: managerSchema.shape.name.describe('사용자명'),
    managerSignInId: managerSchema.shape.signInId.describe('사용자 로그인 ID'),
    reason: z.string().max(1000, { message: '설명은 최대 1000자까지 입력할 수 있습니다.' }).describe('설명'),
    order: z.enum(['asc', 'desc']).nullish().default('desc').describe('정렬'),
  })
  .partial();
export type HistoryFilter = z.infer<typeof historyFilterSchema>;

/**
 * 작업 이력 목록 조회 요청 DTO
 */
export const selectHistoriesRequestDto = z.object({
  pagination: z.preprocess(stringToNumberObject, paginationSchema),
  filters: z.preprocess(nullToUndefinedObject, historyFilterSchema),
});
export type SelectHistoriesRequestDto = z.infer<typeof selectHistoriesRequestDto>;

export const historyResponseItemSchema = z.object({
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
});
export type HistoryResponseItem = z.infer<typeof historyResponseItemSchema>;

export const selectHistoriesResponseDto = baseApiResponseSchema.extend({
  data: z.object({
    histories: historyResponseItemSchema.array(),
    pagination: paginationSchema,
  }),
});
export type SelectHistoriesResponseDto = z.infer<typeof selectHistoriesResponseDto>;

export const selectHistoryResponseDto = baseApiResponseSchema.extend({
  data: historyResponseItemSchema.nullable(),
});
export type SelectHistoryResponseDto = z.infer<typeof selectHistoryResponseDto>;
