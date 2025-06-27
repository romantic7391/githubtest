import { z } from 'zod';

/**
 * 현재 페이지
 */
export const pageSchema = z.coerce
  .number({
    invalid_type_error: '페이지는 숫자여야 합니다.',
  })
  .int({
    message: '페이지는 정수여야 합니다.',
  })
  .min(1, {
    message: '페이지는 1 이상이어야 합니다.',
  })
  .default(1);

/**
 * 페이지 크기. 페이지 당 아이템 수
 */
export const pageSizeSchema = z.coerce
  .number({
    invalid_type_error: '페이지 크기는 숫자여야 합니다.',
  })
  .int({
    message: '페이지 크기는 정수여야 합니다.',
  })
  .min(1, {
    message: '페이지 크기는 1 이상이어야 합니다.',
  })
  .default(10);

export interface Pagination {
  total: number;
  totalPage: number;
  page: number;
  pageSize: number;
}
