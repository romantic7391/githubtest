import { z } from 'zod';

export const paginationSchema = z.object({
  /**
   * 현재 페이지
   */
  page: z.number().min(1).default(1),
  /**
   * 페이지당 아이템 수
   */
  pageSize: z.number().min(1).default(10),
  /**
   * 총 아이템 수
   */
  total: z.number().nonnegative().default(0),
});
/**
 * 페이지네이션
 */
export type Pagination = z.infer<typeof paginationSchema>;
