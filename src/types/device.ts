import { baseApiResponseSchema, datetimeSchema, paginationSchema } from './common';
import { z } from 'zod';

/**
 * 센서 장치
 */
export const deviceSchema = z.object({
  model: z.string().max(16).default(''),
  ip: z.string().ip({ version: 'v4' }).nullable(),
  rip: z.string().ip({ version: 'v4' }).nullable(),
  splrate: z.number().int().max(6).default(0),
  interval: z.number().int().max(6).default(0),
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
  kind: z.number().int().nonnegative().max(11).default(0),
  extra: z.string().max(65535).nullable(),
  sdate: datetimeSchema.nullable(),
  edate: datetimeSchema.nullable(),
  created: datetimeSchema.nullable(),
  device: deviceSchema,
});
/**
 * 학교 센서 장치
 */
export type Device = z.infer<typeof deviceRelSchema>;

/**
 * 센서 장치 목록 응답
 */
export const devicesApiResponseSchema = baseApiResponseSchema.extend({
  data: z.object({
    devices: deviceRelSchema.array(),
    pagination: paginationSchema,
  }),
});
/**
 * 센서 장치 목록 응답
 */
export type DevicesApiResponse = z.infer<typeof devicesApiResponseSchema>;

export const deviceCreateSchema = deviceRelSchema.omit({ mac: true });
