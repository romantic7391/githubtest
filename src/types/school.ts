import { REGEX_ALPHANUMERIC } from '@/lib/regex.constant';
import { z } from 'zod';
import {
  baseApiResponseSchema,
  datetimeSchema,
  paginationSchema,
  type BaseApiResponse,
  type Pagination,
} from './common';
import { areaSchema } from './area';

/**
 * 학교
 */
export const schoolSchema = z.object({
  schoolNo: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).default(0),
  sname: z.string().min(1).max(80),
  scode: z.string().min(1).max(10).regex(REGEX_ALPHANUMERIC),
  area: areaSchema.shape.area,
  modbus: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).default(0),
  modbusHost: z.string().max(20).nullable(),
  modbusPort: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).default(502),
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
 * 학교 목록 필터
 */
export const schoolListFilterSchema = schoolSchema
  .omit({
    schoolNo: true,
    area: true,
    modbus: true,
    modbusHost: true,
    modbusPort: true,
    created: true,
  })
  .extend({
    sname: z.string().optional(),
    scode: z.string().optional(),
    useOrderSheet: z.enum(['Y', 'N']).optional(),
    active: z.enum(['Y', 'N']).optional(),
    administrationCode: z.string().optional(),
  })
  .partial();
/**
 * 학교 목록 필터
 */
export type SchoolListFilter = z.infer<typeof schoolListFilterSchema>;

/**
 * 학교 목록 파라미터
 */
export const schoolListParamsSchema = z.object({
  page: z.number().positive().default(1),
  pageSize: z.number().positive().default(10),
  filters: schoolListFilterSchema.optional(),
});
/**
 * 학교 목록 파라미터
 */
export type SchoolListParams = z.infer<typeof schoolListParamsSchema>;

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
export type SchoolsApiResponse = BaseApiResponse & {
  data: {
    schools: School[];
    pagination: Pagination;
  };
};

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
export const schoolCreateSchema = schoolSchema.omit({ schoolNo: true, created: true }).extend({
  parentNo: z.number().nullable(),
});
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

export const schoolDtoSchema = schoolSchema.pick({
  schoolNo: true,
  area: true,
});
/**
 * 학교 DTO
 */
export type SchoolDto = z.infer<typeof schoolDtoSchema>;
