import { z } from 'zod';

// 관리자 기본 스키마
export const managerSchema = z.object({
  managerNo: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  role: z.enum(['ADMIN', 'USER']),
  createdAt: z.string(),
  updatedAt: z.string(),
});
