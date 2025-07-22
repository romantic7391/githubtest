import { z } from 'zod';

// 공통 컨텍스트 Zod 스키마
export const commonContextSchema = z.object({
  managerNo: z.number(),
  schoolNo: z.number(),
  ip: z.string(),
  userAgent: z.string(),
});

export type CommonContext = z.infer<typeof commonContextSchema>;

// 권한 체크에 필요한 최소 파라미터 Zod 스키마
export const permissionParamsSchema = z.object({
  schoolNo: z.union([z.number(), z.string()]).nullable().optional(),
  area: z.string().nullable().optional(),
  permissionNo: z.number().optional(),
});

export type PermissionParams = z.infer<typeof permissionParamsSchema>;
