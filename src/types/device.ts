import { baseApiResponseSchema, datetimeSchema, paginationSchema } from './common';
import { z } from 'zod';

/**
 * 센서 장치
 */
export const deviceSchema = z.object({
  model: z.string().max(16).default(''),
  ip: z.string().ip({ version: 'v4' }).nullable(),
  rip: z.string().ip({ version: 'v4' }).nullable(),
  splrate: z.number().int().max(9999999).default(0),
  interval: z.number().int().max(9999999).default(0),
  ver: z.string().max(24).default(''),
  tags: z.string().max(65535).nullable(),
  checkin: datetimeSchema.nullable(),
  created: datetimeSchema.nullable(),
});

/**
 * 학교 센서 장치
 */
export const deviceRelSchema = z.object({
  mac: z.string().min(1).max(16),
  name: z.string().max(65535).nullable(),
  summary: z.string().max(65535).nullable(),
  kind: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).default(0),
  extra: z.string().max(65535).nullable(),
  sdate: datetimeSchema.nullable(),
  edate: datetimeSchema.nullable(),
  created: datetimeSchema.nullable(),
  device: deviceSchema,
});

/**
 * DB에서 조회되는 센서 장치 구조
 */
export const deviceDbSchema = deviceRelSchema.omit({ device: true }).merge(deviceSchema).extend({
  device_created: datetimeSchema.nullable(),
});

/**
 * 학교 센서 장치
 */
export type Device = z.infer<typeof deviceRelSchema>;

/**
 * DB에서 조회되는 센서 장치 타입
 */
export type DeviceDb = z.infer<typeof deviceDbSchema>;

/**
 * 센서 장치 목록 응답
 */
export const devicesApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    items: deviceRelSchema.array(),
    pagination: paginationSchema,
  }),
});
/**
 * 센서 장치 목록 응답
 */
export type DevicesApiResponse = z.infer<typeof devicesApiResponseSchema>;

export const deviceApiResponseSchema = baseApiResponseSchema.extend({
  data: deviceRelSchema,
});
/**
 * 센서 장치 응답
 */
export type DeviceApiResponse = z.infer<typeof deviceApiResponseSchema>;

/**
 * 센서 장치 생성 객체
 */
export const deviceCreateSchema = deviceRelSchema
  .omit({
    created: true,
  })
  .extend({
    schoolNo: z.number(),
  });

/**
 * 센서 장치 생성 객체
 */
export type DeviceCreate = z.infer<typeof deviceCreateSchema>;

/**
 * 센서 장치 생성 또는 수정 응답
 */
export const deviceCreateOrUpdateApiResponseSchema = baseApiResponseSchema.extend({
  data: deviceRelSchema.pick({ mac: true }),
});
/**
 * 센서 장치 생성 또는 수정 응답
 */
export type DeviceCreateOrUpdateApiResponse = z.infer<typeof deviceCreateOrUpdateApiResponseSchema>;

/**
 * 센서 장치 기본 정보 (MAC 주소와 학교 번호만)
 */
export const deviceBasicSchema = z.object({
  mac: z.string(),
  school_no: z.number(),
  oldMac: z.string().optional(),
});

/**
 * 센서 장치 기본 정보 타입
 */
export type DeviceBasic = z.infer<typeof deviceBasicSchema>;

/**
 * 센서 장치 필터링
 */
export const deviceFilterSchema = z
  .object({
    model: z.string().max(16).nullable(),
    ip: z.string().ip({ version: 'v4' }).nullable(),
    rip: z.string().ip({ version: 'v4' }).nullable(),
    interval: z.number().int().max(9999999).nullable(),
    ver: z.string().max(24).nullable(),
    tags: z.string().max(65535).nullable(),
  })
  .partial();

/**
 * 센서 장치 필터링 타입
 */
export type DeviceFilter = z.infer<typeof deviceFilterSchema>;

/**
 * 센서 장치 목록 조회 파라미터
 */
export const deviceListParamsSchema = z.object({
  school_no: z.number(),
  page: z.number().positive().default(1),
  pageSize: z.number().positive().default(10),
  filters: deviceFilterSchema.optional(),
});

/**
 * 센서 장치 목록 조회 파라미터 타입
 */
export type DeviceListParams = z.infer<typeof deviceListParamsSchema>;

/**
 * 학교 센서 장치 폼
 */
export const deviceRelFormSchema = deviceRelSchema.omit({ device: true }).extend({
  device: deviceSchema.partial(),
});

/**
 * 학교 센서 장치 폼 타입
 */
export type DeviceRelForm = z.infer<typeof deviceRelFormSchema>;
