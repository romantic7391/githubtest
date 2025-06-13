import { REGEX_ALPHANUMERIC, REGEX_NUMBER } from '@/lib/regex.constant';
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
  sname: z
    .string()
    .min(1, {
      message: '학교 이름을 입력해주세요.',
    })
    .max(80, {
      message: `학교 이름은 최대 25자까지 입력할 수 있습니다.`,
    }),
  scode: z
    .string()
    .min(1, {
      message: '학교 코드를 입력해주세요.',
    })
    .max(10, {
      message: `학교 코드는 최대 10자까지 입력할 수 있습니다.`,
    })
    .regex(REGEX_ALPHANUMERIC, {
      message: '학교 코드는 알파벳과 자연수만 입력할 수 있습니다.',
    }),
  area: areaSchema.shape.area,
  modbus: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER).default(0),
  modbusHost: z.string().max(20).nullable(),
  modbusPort: z
    .number({
      message: '포트 번호는 자연수만 입력할 수 있습니다.',
    })
    .nonnegative({
      message: '포트 번호는 0 이상의 자연수만 입력할 수 있습니다.',
    })
    .max(65535, {
      message: '포트 번호는 최대 65535까지 입력할 수 있습니다.',
    })
    .default(502),
  useOrderSheet: z.enum(['Y', 'N']).default('N'),
  active: z.enum(['Y', 'N']).default('Y'),
  administrationCode: z
    .string()
    .regex(REGEX_NUMBER, {
      message: '행정표준코드(기관)은 숫자만 입력할 수 있습니다.',
    })
    .max(50)
    .nullable(),
  created: datetimeSchema.nullable(),
  parentNo: z
    .number({
      message: '상위 기관 번호는 자연수만 입력할 수 있습니다.',
    })
    .min(1, {
      message: '상위 기관 번호는 1 이상의 자연수만 입력할 수 있습니다.',
    })
    .max(Number.MAX_SAFE_INTEGER)
    .default(0)
    .nullable(),
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
export const schoolCreateSchema = schoolSchema.omit({ schoolNo: true, created: true }).merge(
  z.object({
    administrationCode: z.coerce
      .string()
      .min(1, {
        message: '행정표준코드(기관)을 입력해주세요.',
      })
      .regex(REGEX_NUMBER, {
        message: '행정표준코드(기관)은 숫자만 입력할 수 있습니다.',
      })
      .max(50)
      .nullable(),
  }),
);
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

export const schoolFormSchema = schoolSchema.merge(
  z.object({
    modbus: z.preprocess((val) => {
      if (typeof val === 'string') return Number(val);
      return val;
    }, schoolSchema.shape.modbus),

    modbusHost: z
      .preprocess((val) => {
        if (val === '') return null;
        return val;
      }, schoolSchema.shape.modbusHost)
      .transform((val) => (val === '' ? null : val)),

    administrationCode: z
      .preprocess((val) => {
        if (val === '') return null;
        return val;
      }, schoolSchema.shape.administrationCode)
      .transform((val) => (val === '' ? null : val)),

    parentNo: z.preprocess((val) => {
      if (val === '') return null;
      return val;
    }, schoolSchema.shape.parentNo),
  }),
);

/**
 * 학교 DTO
 */

export const schoolDtoSchema = schoolSchema.pick({
  schoolNo: true,
  area: true,
});
/**
 * 학교 DTO 객체
 */
export type SchoolDto = z.infer<typeof schoolDtoSchema>;

/**
 * 학교 존재 여부 확인 DTO
 */

export const existsRnSchoolByScodeDtoSchema = schoolSchema.pick({
  scode: true,
});

/**
 * 학교 존재 여부 DTO 객채채
 */
export type existsRnSchoolByScodeDto = z.infer<typeof existsRnSchoolByScodeDtoSchema>;

/**
 * 학교 존재 여부 확인 응답
 */
export const existsRnSchoolByAdministrationCodeDtoSchema = schoolSchema.pick({
  administrationCode: true,
});

/**
 * 학교 존재 여부 DTO 객체
 */
export type existsRnSchoolByAdministrationCodeDto = z.infer<typeof existsRnSchoolByAdministrationCodeDtoSchema>;

/**
 * 학교 존재 여부 확인 DTO
 */

export const getRnSchoolByScodeDtoSchema = schoolSchema.pick({
  scode: true,
});

/**
 * 학교 존재 여부 DTO 객채채
 */
export type getRnSchoolByScodeDto = z.infer<typeof getRnSchoolByScodeDtoSchema>;

/**
 * 학교 존재 여부 확인 DTO
 */

export const findRnSchoolsByAreasDtoSchema = schoolSchema.pick({
  area: true,
});

/**
 * 학교 존재 여부 DTO 객채채
 */
export type findRnSchoolsByAreasDto = z.infer<typeof findRnSchoolsByAreasDtoSchema>;

/**
 * 학교 존재 여부 확인 DTO
 */

export const findSchoolBySchoolNoDtoSchema = schoolSchema.pick({
  schoolNo: true,
});

/**
 * 학교 존재 여부 DTO 객채채
 */
export type findSchoolBySchoolNoDto = z.infer<typeof findSchoolBySchoolNoDtoSchema>;

/**
 * 학교 수정 DTO
 */

export const updateRnSchoolDtoSchema = schoolSchema.pick({
  sname: true,
  scode: true,
  area: true,
  administrationCode: true,
  schoolNo: true,
});

/**
 * 학교 존재 여부 DTO 객채채
 */
export type updateRnSchoolDto = z.infer<typeof schoolSchema>;

/**
 * 학교 존재 여부 확인 DTO
 */

export const deleteRnSchoolDtoSchema = schoolSchema.pick({
  schoolNo: true,
});

/**
 * 학교 존재 여부 DTO 객채채
 */
export type deleteRnSchoolDto = z.infer<typeof deleteRnSchoolDtoSchema>;
