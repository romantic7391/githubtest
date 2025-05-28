import { z } from 'zod';

// Manager 스키마
export const ManagerSchema = z.object({
  no: z.number(),
  school_no: z.number(),
  login_id: z.string().max(16),
  name: z.string().max(20),
  passwd: z.string().nullable(),
});

// ManagerGroup 스키마
export const ManagerGroupSchema = z.object({
  group_no: z.number(),
  no: z.number(),
});

// Group 스키마
export const GroupSchema = z.object({
  group_no: z.number(),
  school_no: z.number().nullable(),
  name: z.string().max(20).optional(),
  parent_group_no: z.number().nullable(),
});

// Permission 스키마
export const PermissionSchema = z.object({
  permission_no: z.number(),
  name: z.string().max(20),
  description: z.string().nullable(),
  default_extra_condition: z.string().max(50).nullable(),
  default_extra_limit: z.string().max(50).nullable(),
});

// GroupPermission 스키마
export const GroupPermissionSchema = z.object({
  group_no: z.number(),
  permission_no: z.number(),
  is_allowed: z.enum(['Y', 'N']).nullable(),
  override: z.enum(['Y', 'N']).nullable(),
  extra_condition: z.string().nullable(),
  extra_limit: z.string().max(50).nullable(),
});

// CommonContext 스키마
export const CommonContextSchema = z.object({
  manager_no: z.number(),
  ip: z.string(),
  user_agent: z.string(),
});

// 타입 추론
export type Manager = z.infer<typeof ManagerSchema>;
export type ManagerGroup = z.infer<typeof ManagerGroupSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type GroupPermission = z.infer<typeof GroupPermissionSchema>;
export type CommonContext = z.infer<typeof CommonContextSchema>;
