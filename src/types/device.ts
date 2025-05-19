import dayjs from '@/lib/dayjs';
import { DEFAULT_DATETIME_FORMAT } from '@/lib/default.constant';
import { z } from 'zod';

export const schoolDeviceSchema = z.object({
  schoolNo: z.number().int().nonnegative(),
  mac: z.string().min(1).max(16),
  name: z.string().max(65535).optional(),
  summary: z.string().max(65535).optional(),
  kind: z.number().int().nonnegative().max(11).default(0),
  extra: z.string().max(65535).optional(),
  sdate: z
    .string()
    .transform((v) => dayjs(v).format(DEFAULT_DATETIME_FORMAT))
    .optional(),
  edate: z
    .string()
    .transform((v) => dayjs(v).format(DEFAULT_DATETIME_FORMAT))
    .optional(),
  created: z
    .string()
    .transform((v) => dayjs(v).format(DEFAULT_DATETIME_FORMAT))
    .optional(),
});
export type SchoolDevice = z.infer<typeof schoolDeviceSchema>;
