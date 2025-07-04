import { z } from 'zod';

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
