import { z } from 'zod';

// 기본 스키마
export const PermissionSchema = z.object({
  permission_no: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  default_extra_condition: z.string().nullable(),
  default_extra_limit: z.string().nullable(),
});

export const CommonContextSchema = z.object({
  manager_no: z.number(),
  ip: z.string(),
  user_agent: z.string(),
});

export const GroupSchema = z.object({
  group_no: z.number(),
  school_no: z.number(),
  name: z.string(),
  parent_group_no: z.number(),
});

export const ManagerSchema = z.object({
  no: z.number(),
  school_no: z.number(),
  login_id: z.string(),
  name: z.string(),
  passwd: z.string().nullable(),
});

export const ManagerGroupSchema = z.object({
  group_no: z.number(),
  no: z.number(),
  manager_no: z.number(),
});

export const GroupPermissionSchema = z.object({
  group_no: z.number(),
  permission_no: z.number(),
  is_allowed: z.enum(['Y', 'N']),
  extra_condition: z.string().nullable(),
  extra_limit: z.string().nullable(),
});

// 타입 추론을 위한 타입 정의
export type Permission = z.infer<typeof PermissionSchema>;
export type CommonContext = z.infer<typeof CommonContextSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type Manager = z.infer<typeof ManagerSchema>;
export type ManagerGroup = z.infer<typeof ManagerGroupSchema>;
export type GroupPermission = z.infer<typeof GroupPermissionSchema>;
