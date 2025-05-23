import { z } from 'zod';

// 히스토리 기본 스키마
export const historySchema = z.object({
  manager_no: z.number().nullable(),
  school_no: z.number().nullable(),
  ip: z.string().nullable(),
  user_agent: z.string().nullable(),
  action_type: z.enum(['S', 'I', 'U', 'D']),
  target_table: z.string().nullable(),
  target_id: z.string().nullable(),
  old_values: z.string().nullable(),
  new_values: z.string().nullable(),
  reason: z.string().nullable(),
});

// 히스토리 메타 정보 스키마
export const historyMetaSchema = z.object({
  ip: z.string().nullable(),
  manager_no: z.number().nullable(),
  school_no: z.number().nullable().optional(),
  user_agent: z.string().nullable(),
});

// 히스토리 번호 스키마
export const historyNoSchema = z.object({
  historyNo: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
});

export type History = z.infer<typeof historySchema>;
export type LogMeta = z.infer<typeof historyMetaSchema>;
export type HistoryNo = z.infer<typeof historyNoSchema>;
