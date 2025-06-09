import dayjs from '@/lib/dayjs';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_PAGE_SIZE } from '@/lib/default.constant';
import { z } from 'zod';

/**
 * 응답 객체에 공통적으로 사용되는 필드를 정의합니다.
 *
 * @example 단일 데이터 응답
 * ```ts
 * somethingSchema = z.object({});
 * somethingResponseSchema = baseApiResponseSchema.extend({
 *   data: somethingSchema,
 * });
 *
 * type SomethingApiResponse = z.infer<typeof somethingResponseSchema>;
 * ```
 *
 * @example 배열 데이터 응답
 * ```ts
 * somethingSchema = z.object({});
 * somethingResponseSchema = baseApiResponseSchema.extend({
 *   data: somethingSchema.array(),
 * });
 *
 * type SomethingApiResponse = z.infer<typeof somethingResponseSchema>;
 * ```
 */
export const baseApiResponseSchema = z.object({
  /**
   * 성공 여부. 성공 시 `true`, 실패 시 `false`를 반환합니다.
   */
  success: z.boolean().default(false),
  /**
   * 메시지. 성공 시 빈 문자열, 실패 시 에러 메시지를 반환합니다.
   */
  message: z.string().default(''),
  /**
   * 데이터. 데이터가 필요한 응답에서 사용합니다.
   */
  data: z.array(z.unknown()).or(z.unknown()),
  /**
   * 에러. 에러가 발생한 경우 상세 정보를 포함합니다.
   */
  errors: z.array(z.unknown()).optional(),
});
/**
 * 응답 객체에 공통적으로 사용되는 필드를 정의합니다.
 */
export type BaseApiResponse = z.infer<typeof baseApiResponseSchema>;

/**
 * 페이지네이션
 */
export const paginationSchema = z.object({
  /**
   * 현재 페이지
   */
  page: z.number().positive().default(1),
  /**
   * 페이지당 아이템 수
   */
  pageSize: z.number().positive().default(DEFAULT_PAGE_SIZE),
  /**
   * 총 아이템 수
   */
  total: z.number().nonnegative().default(0),
  /**
   * 총 페이지 수
   */
  totalPages: z.number().positive().default(1),
});
/**
 * 페이지네이션
 */
export type Pagination = z.infer<typeof paginationSchema>;

/**
 * DATETIME 형식 문자열
 */
export const datetimeSchema = z.string().transform((v) => dayjs(v).format(DEFAULT_DATETIME_FORMAT));

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface BaseApiResponse1 {
  success: boolean;
  message: string;
}
