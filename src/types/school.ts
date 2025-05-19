import { REGEX_ALPHANUMERIC } from '@/lib/regex.constant';
import { z } from 'zod';
import { baseApiResponseSchema, datetimeSchema, paginationSchema } from './common';
import { areaSchema } from './area';

/**
 * 학교
 */
export const schoolSchema = z.object({
  schoolNo: z.number().nonnegative().max(20).default(0),
  sname: z.string().min(1).max(80),
  scode: z.string().min(1).max(10).regex(REGEX_ALPHANUMERIC),
  area: areaSchema.shape.area,
  modbus: z.number().nonnegative().max(5).default(0),
  modbusHost: z.string().max(20).nullable(),
  modbusPort: z.number().nonnegative().default(502),
  useOrderSheet: z.enum(['Y', 'N']).default('N'),
  active: z.enum(['Y', 'N']).default('Y'),
  administrationCode: z.string().max(50).nullable(),
  created: datetimeSchema.nullable(),
});
/**
 * 학교
 */
export type School = z.infer<typeof schoolSchema>;

/**
 * 학교 목록 응답
 */
export const schoolsApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    schools: schoolSchema.array(),
    pagination: paginationSchema,
  }),
});
/**
 * 학교 목록 응답
 */
export type SchoolsApiResponse = z.infer<typeof schoolsApiResponseSchema>;

/**
 * 학교 응답
 */
export const schoolApiResponseSchema = baseApiResponseSchema.extend({
  data: schoolSchema,
});
/**
 * 학교 응답
 */
export type SchoolApiResponse = z.infer<typeof schoolApiResponseSchema>;

/**
 * 학교 생성 객체
 */
export const schoolCreateSchema = schoolSchema.omit({ schoolNo: true, created: true });
/**
 * 학교 생성 객체
 */
export type SchoolCreate = z.infer<typeof schoolCreateSchema>;

/**
 * 학교 생성 또는 수정 응답
 */
export const schoolCreateOrUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: schoolSchema.pick({ schoolNo: true }),
});
/**
 * 학교 생성 또는 수정 응답
 */
export type SchoolCreateOrUpdateApiResponse = z.infer<typeof schoolCreateOrUpdateApiResponseSchema>;
