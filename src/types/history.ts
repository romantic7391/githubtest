import { z } from 'zod';
import {
  datetimeSchema,
  nullToUndefinedObject,
  paginationSchema,
  stringToNumber,
  stringToNumberObject,
} from './common';
import { areaSchema } from './area';
import { schoolSchema } from './school';
import { groupSchema } from './permission/group';
import { managerSchema } from './manager';

// 히스토리 기본 스키마
export const historySchema = z.object({
  managerNo: z.number().nullable(),
  schoolNo: z.number().nullable(),
  ip: z.string().nullable(),
  userAgent: z.string().nullable(),
  actionType: z.enum(['S', 'I', 'U', 'D']),
  targetTable: z.string().nullable(),
  targetId: z.string().nullable(),
  oldValues: z.string().nullable(),
  newValues: z.string().nullable(),
  reason: z.string().nullable(),
});

// 히스토리 메타 정보 스키마
export const logMetaSchema = z.object({
  ip: z.string().nullable(),
  managerNo: z.number(),
  userAgent: z.string().nullable(),
  schoolNo: z.number(),
});

// 히스토리 번호 스키마
export const historyNoSchema = z.object({
  historyNo: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
});

export type History = z.infer<typeof historySchema>;
export type LogMeta = z.infer<typeof logMetaSchema>;
export type HistoryNo = z.infer<typeof historyNoSchema>;

export const selectHistoryDtoSchema = z.object({
  pagination: z.preprocess(stringToNumberObject, paginationSchema),
  filters: z.preprocess(
    nullToUndefinedObject,
    z
      .object({
        area: areaSchema.shape.area,
        schoolNo: z.preprocess(stringToNumber, schoolSchema.shape.schoolNo),
        groupNo: z.preprocess(stringToNumber, groupSchema.shape.groupNo),
        managerNo: z.preprocess(stringToNumber, managerSchema.shape.managerNo),
        ip: z.string().ip({ version: 'v4' }),
        userAgent: z.string(),
        actionType: z.enum(['S', 'I', 'U', 'D']),
        reason: z.string(),
        startDate: datetimeSchema,
        endDate: datetimeSchema,
      })
      .partial()
      .extend({
        order: z.enum(['asc', 'desc']).default('desc'),
      }),
  ),
});

export type SelectHistoryDto = z.infer<typeof selectHistoryDtoSchema>;
