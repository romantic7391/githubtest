import { z } from 'zod';
import { baseApiResponseSchema, paginationSchema } from './common';

/**
 * 지역
 */
export const areaSchema = z.object({
  areaNo: z.number().max(20),
  /**
   * 지역 영문명
   */
  area: z
    .string()
    .regex(/^[a-z0-9]+$/)
    .max(50)
    .nullable(),
  x: z.number().max(20).nullable(),
  y: z.number().max(20).nullable(),
  areaCode: z
    .string()
    .regex(/^[A-Z0-9]+$/)
    .max(50)
    .nullable(),
});
/**
 * 지역
 */
export type Area = z.infer<typeof areaSchema>;

/**
 * 지역 생성 객체
 */
export const areaCreateShcema = areaSchema.omit({ areaNo: true, area: true }).extend({
  area: z
    .string()
    .regex(/^[a-z0-9]+$/)
    .max(50),
});
/**
 * 지역 생성 객체
 */
export type AreaCreate = z.infer<typeof areaCreateShcema>;

/**
 * 지역 목록 응답
 */
export const areasApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    areas: areaSchema.array(),
    pagination: paginationSchema,
  }),
});
/**
 * 지역 목록 응답
 */
export type AreasApiResponse = z.infer<typeof areasApiResponseSchema>;

/**
 * 지역 응답
 */
export const areaApiResponseSchema = baseApiResponseSchema.extend({
  data: areaSchema,
});
/**
 * 지역 응답
 */
export type AreaApiResponse = z.infer<typeof areaApiResponseSchema>;

/**
 * 지역 생성 또는 수정 응답
 */
export const areaCreateOrUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: areaSchema.pick({ area: true }),
});
/**
 * 지역 생성 또는 수정 응답
 */
export type AreaCreateOrUpdateApiResponse = z.infer<typeof areaCreateOrUpdateApiResponseSchema>;
