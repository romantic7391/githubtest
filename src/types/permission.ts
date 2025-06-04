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

// SchoolHierarchy 스키마 (파라미터용)
export const SchoolHierarchySchema = z.object({
  current: z.object({
    schoolNo: z.number(),
    name: z.string(),
    area: z.string(),
    // ... 기타 필요한 학교 속성들
  }),
  upper: z
    .object({
      schoolNo: z.number(),
      name: z.string(),
      area: z.string(),
      // ... 기타 필요한 학교 속성들
    })
    .optional(),
  upperUpper: z
    .object({
      schoolNo: z.number(),
      name: z.string(),
      area: z.string(),
      // ... 기타 필요한 학교 속성들
    })
    .optional(),
  lower: z
    .array(
      z.object({
        schoolNo: z.number(),
        name: z.string(),
        area: z.string(),
        // ... 기타 필요한 학교 속성들
      }),
    )
    .optional(),
});

// PermissionCheckResult 스키마 (반환값용)
export const PermissionCheckResultSchema = z.object({
  allowed: z.enum(['Y', 'N']),
  override: z.enum(['Y', 'N']).nullable(),
  extraCondition: z.string().nullable(),
});

// 타입 추론
export type Manager = z.infer<typeof ManagerSchema>;
export type ManagerGroup = z.infer<typeof ManagerGroupSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type GroupPermission = z.infer<typeof GroupPermissionSchema>;
export type CommonContext = z.infer<typeof CommonContextSchema>;
export type SchoolHierarchy = z.infer<typeof SchoolHierarchySchema>;
export type PermissionCheckResult = z.infer<typeof PermissionCheckResultSchema>;
