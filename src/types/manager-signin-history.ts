import { z } from 'zod';
import ip from 'ip';
import { managerSchema } from './manager';
import { datetimeSchema, ynSchema, paginationSchema, baseApiResponseSchema } from './common';

export const managerSignInHistorySchema = z.object({
  historyNo: z.coerce.number().optional(),
  managerNo: managerSchema.shape.managerNo,
  signInTime: datetimeSchema,
  signOutTime: datetimeSchema.nullable(),
  success: ynSchema,
  remoteAddr: z.union([
    // 1. 입력이 문자열일 경우
    z
      .string()
      .ip({ version: 'v4', message: 'IP 주소는 IPv4 형식이어야 합니다.' })
      .transform((v) => ip.toLong(v)),

    // 2. 입력이 숫자일 경우
    z
      .number()
      .int({ message: 'IP 숫자 값은 정수여야 합니다.' })
      .min(0, { message: 'IP 숫자 값은 0 이상이어야 합니다.' })
      .max(4294967295, { message: '유효한 IPv4 숫자 범위를 벗어났습니다.' }),
  ]),
  signInId: managerSchema.shape.signInId.nullable(),
});

export type ManagerSignInHistory = z.infer<typeof managerSignInHistorySchema>;

// 로그인 이력 필터 스키마
export const signInHistoryFilterSchema = z
  .object({
    startDate: datetimeSchema.describe('시작 일시'),
    endDate: datetimeSchema.describe('종료 일시'),
    historyNo: z.coerce.number({ message: '이력 번호는 숫자여야 합니다.' }).describe('이력 번호'),
    success: ynSchema.describe('성공 여부'),
    signInId: managerSchema.shape.signInId.describe('로그인 ID'),
    managerName: managerSchema.shape.name.describe('사용자명'),
    schoolName: z.string().describe('학교명'),
    schoolCode: z.string().describe('학교 코드'),
    ip: z.string().ip({ version: 'v4', message: 'IP 주소는 IPv4 형식이어야 합니다.' }).describe('IP 주소'),
    order: z.enum(['asc', 'desc']).nullish().default('desc').describe('정렬'),
  })
  .partial();

// 로그인 이력 응답 아이템 스키마
export const signInHistoryResponseItemSchema = z.object({
  // 이력 정보
  historyNo: z.number().positive(),
  signInTime: datetimeSchema,
  signOutTime: datetimeSchema.nullable(),
  success: ynSchema,
  remoteAddr: z.number(),
  ip: z.string(),

  // 사용자
  managerNo: z.number().nonnegative(),
  signInId: z.string().nullable(),
  managerName: z.string().nullable(),

  // 학교
  schoolNo: z.number().nonnegative(),
  schoolCode: z.string(),
  schoolName: z.string(),
});

// 로그인 이력 목록 조회 요청 DTO
export const selectSignInHistoriesRequestDto = z.object({
  pagination: paginationSchema,
  filters: signInHistoryFilterSchema,
});

// 로그인 이력 목록 조회 응답 DTO
export const selectSignInHistoriesResponseDto = baseApiResponseSchema.extend({
  data: z.object({
    histories: signInHistoryResponseItemSchema.array(),
    pagination: paginationSchema,
  }),
});

// 로그인 이력 상세 조회 응답 DTO
export const selectSignInHistoryResponseDto = baseApiResponseSchema.extend({
  data: signInHistoryResponseItemSchema.nullable(),
});

export type SignInHistoryFilter = z.infer<typeof signInHistoryFilterSchema>;
export type SignInHistoryResponseItem = z.infer<typeof signInHistoryResponseItemSchema>;
export type SelectSignInHistoriesRequestDto = z.infer<typeof selectSignInHistoriesRequestDto>;
export type SelectSignInHistoriesResponseDto = z.infer<typeof selectSignInHistoriesResponseDto>;
export type SelectSignInHistoryResponseDto = z.infer<typeof selectSignInHistoryResponseDto>;
