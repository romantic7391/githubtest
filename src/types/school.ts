import { REGEX_ALPHANUMERIC } from '@/lib/regex.constant';
import { z } from 'zod';
import dayjs from '@/lib/dayjs';
import { paginationSchema } from './common';
import { schoolDeviceSchema } from './device';

export const schoolSearchFilterSchema = z.object({
  /**
   * 현재 페이지
   */
  page: z.preprocess((v) => {
    if (typeof v === 'number') return v;
    else if (typeof v === 'string') return parseInt(v, 10);
    return 0;
  }, z.number().int().min(1).default(1).catch(1)),
  /**
   * 페이지당 아이템 수
   */
  pageSize: z.preprocess((v) => {
    if (typeof v === 'number') return v;
    else if (typeof v === 'string') return parseInt(v, 10);
    return 0;
  }, z.number().int().min(1).default(10).catch(10)),
  /**
   * 학교 이름 필터
   */
  snames: z.string().array().default([]).catch([]),
  /**
   * 학교 코드 필터
   */
  scodes: z.string().array().default([]).catch([]),
  /**
   * 학교 구분 필터
   */
  stypes: z.string().array().default([]).catch([]),
});
export type SchoolSearchFilter = z.infer<typeof schoolSearchFilterSchema>;

export const schoolSchema = z.object({
  /**
   * 학교 변호.
   */
  no: z.number().nonnegative().default(0),
  /**
   * 학교 이름.
   */
  sname: z.string().min(1).max(25),
  /**
   * 학교 코드.
   */
  scode: z.string().min(1).max(10).regex(REGEX_ALPHANUMERIC),
  /**
   * 지역.
   */
  area: z.string().min(1).max(16).regex(REGEX_ALPHANUMERIC),
  /**
   * 작업지시서 사용 여부. `Y` 또는 `N`으로 넣어도 boolean으로 바뀝니다.
   */
  useOrderSheet: z.preprocess((v) => {
    if (typeof v === 'string') {
      if (v.toUpperCase() === 'Y') return true;
      if (v.toUpperCase() === 'N') return false;
    }
    return v;
  }, z.boolean().default(false)),
  /**
   * 학교 활성화 여부. `Y` 또는 `N`으로 넣어도 boolean으로 바뀝니다.
   */
  active: z.preprocess((v) => {
    if (typeof v === 'string') {
      if (v.toUpperCase() === 'Y') return true;
      if (v.toUpperCase() === 'N') return false;
    }
    return v;
  }, z.boolean().default(true)),
  /**
   * 생성일.
   */
  created: z
    .string()
    .transform((v) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'))
    .optional(),
  /**
   * 행정코드. NEIS API용.
   */
  administrationCode: z.string().max(50).optional(),
  modbus: z.number().nonnegative().max(5).default(0),
  modbusHost: z.string().max(20).optional(),
  modbusPort: z.number().nonnegative().default(502),
});
export type School = z.infer<typeof schoolSchema>;

export const schoolApiResponseSchema = z.object({
  schools: schoolSchema.array(),
  pagination: paginationSchema,
});
export type SchoolApiResponse = z.infer<typeof schoolApiResponseSchema>;

export const schoolWithDevicesApiResponseSchema = schoolSchema.extend({
  devices: z.object({
    devices: schoolDeviceSchema.array(),
    pagination: paginationSchema,
  }),
});
export type SchoolWithDevicesApiResponse = z.infer<typeof schoolWithDevicesApiResponseSchema>;
