import { z } from 'zod';

/**
 * 히스토리
 */
export const historySchema = z.object({
  historyNo: z.number().min(0).max(Number.MAX_SAFE_INTEGER),
});

// LogMeta 타입 정의
export type LogMeta = {
  manager_no?: number;
  school_no?: number;
  ip?: string | null;
  user_agent?: string | null;
};
