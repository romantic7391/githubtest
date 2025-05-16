import { z } from 'zod';

// 1. zod 스키마 정의
export const deviceSchema = z.object({
  school_no: z.number(),
  mac: z.string(),
  name: z.string().nullable(),
  summary: z.string().nullable(),
  kind: z.number().nullable(),
  extra: z.string().nullable(),
  sdate: z.string().nullable(),
  edate: z.string().nullable(),
  model: z.string().nullable(),
  ip: z.string().nullable(),
  rip: z.string().nullable(),
  splrate: z.number().nullable(),
  interval: z.number().nullable(),
  ver: z.string().nullable(),
  tags: z.string().nullable(),
  checkin: z.string().nullable(),
  oldMac: z.string().optional(),
  newMac: z.string().optional(),
});

// 쿼리 파라미터용 스키마
export const deviceQuerySchema = z.object({
  school_no: z.coerce.number(),
  manager_no: z.coerce.number(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});
