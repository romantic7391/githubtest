import { Permission, Group, ManagerGroup, GroupPermission } from '@/types/permission';
import { getRow, getAll, exec } from '@/lib/mariadb/query';
import { PoolConnection } from 'mariadb';
import { Pagination } from '@/types/common';

/**
 * 권한 정보 조회
 */
export async function findPermissionByName(name: string): Promise<Permission | null> {
  const query = `
    SELECT 
      permission_no,
      name,
      description,
      default_extra_condition,
      default_extra_limit
    FROM permission
    WHERE name = ? AND deleted IS NULL
  `;
  return getRow<Permission>(query, [name]);
}

/**
 * 사용자의 그룹 정보 조회
 */
export async function findManagerGroups(managerNo: number, schoolNo: number): Promise<ManagerGroup[]> {
  const query = `
    SELECT mg.group_no, mg.no
    FROM managerGroup mg
    JOIN manager m ON mg.no = m.no
    JOIN \`group\` g ON mg.group_no = g.group_no
    WHERE mg.no = ? 
      AND mg.deleted IS NULL
      AND (m.school_no = ? OR m.school_no = 0)
    ORDER BY CASE WHEN g.school_no = 0 THEN 0 ELSE 1 END, g.group_no;
  `;
  return getAll<ManagerGroup>(query, [managerNo, schoolNo]);
}

/**
 * 그룹 정보 조회
 */
export async function findGroupByGroupNo(groupNo: number): Promise<Group | null> {
  const query = `
    SELECT group_no, parent_group_no, school_no
    FROM \`group\`
    WHERE group_no = ? AND deleted IS NULL
  `;
  return getRow<Group>(query, [groupNo]);
}

/**
 * 그룹의 특정 권한 정보 조회
 */
export async function findGroupPermission(groupNo: number, permissionNo: number): Promise<GroupPermission | null> {
  const query = `
    SELECT group_no, permission_no, is_allowed, override, extra_condition, extra_limit
    FROM groupPermission
    WHERE group_no = ? AND permission_no = ? AND deleted IS NULL
  `;
  return getRow<GroupPermission>(query, [groupNo, permissionNo]);
}

/**
 * 현황/리포트/관리용: 특정 권한 이름에 대해 전체 그룹/유저/학교의 권한 현황을 조회
 */
export async function getPermissionStatusReport(permissionName: string) {
  const query = `
    SELECT 
      g.parent_group_no,
      g.group_no,
      g.school_no,
      gp.permission_no,
      gp.is_allowed,
      gp.override,
      gp.extra_condition,
      gp.extra_limit,
      mg.no as manager_no
    FROM \`group\` AS g
    JOIN managerGroup AS mg ON g.group_no = mg.group_no
    JOIN groupPermission AS gp ON g.group_no = gp.group_no
    JOIN permission AS p ON gp.permission_no = p.permission_no
    WHERE p.name = ?
      AND g.deleted IS NULL
      AND mg.deleted IS NULL
      AND gp.deleted IS NULL
      AND p.deleted IS NULL
    ORDER BY g.group_no
  `;
  return getAll(query, [permissionName]);
}

// 권한 목록 조회
export async function findPermissions(
  pagination: Pagination,
  filters?: {
    name?: string;
  },
): Promise<{ permissions: Permission[]; total: number }> {
  const offset = (pagination.page - 1) * pagination.pageSize;
  const conditions = ['deleted IS NULL'];
  const params: (string | number)[] = [];

  if (filters?.name) {
    conditions.push('name LIKE ?');
    params.push(`%${filters.name}%`);
  }

  // 전체 개수 조회
  const countQuery = `
    SELECT COUNT(*) as total
    FROM permission
    WHERE ${conditions.join(' AND ')}
  `;
  const totalResult = await getRow<{ total: number }>(countQuery, params);
  const total = totalResult?.total || 0;

  // 권한 목록 조회
  const query = `
    SELECT 
      permission_no,
      name,
      description,
      default_extra_condition,
      default_extra_limit
    FROM permission
    WHERE ${conditions.join(' AND ')}
    ORDER BY permission_no ASC
    LIMIT ? OFFSET ?
  `;

  const permissions = await getAll<Permission>(query, [...params, pagination.pageSize, offset]);

  return { permissions, total };
}

// 권한 생성
export async function insertPermission(dto: Permission, conn?: PoolConnection) {
  const query = `
    INSERT INTO \`permission\` (name, description, default_extra_condition, default_extra_limit) VALUES (?, ?, ?, ?);
  `;
  const params = [dto.name, dto.description, dto.defaultExtraCondition, dto.defaultExtraLimit];
  return exec(query, params, conn);
}

// 권한 수정
export async function updatePermission(dto: Permission, conn?: PoolConnection) {
  const query = `
    UPDATE \`permission\` SET name = ?, description = ?, default_extra_condition = ?, default_extra_limit = ? WHERE permission_no = ?
  `;
  const params = [dto.name, dto.description, dto.defaultExtraCondition, dto.defaultExtraLimit, dto.permission_no];
  return exec(query, params, conn);
}

// 권한 삭제
export async function deletePermission(permissionNo: number, conn?: PoolConnection) {
  const query = `DELETE FROM \`permission\` WHERE permission_no = ?`;
  return exec(query, [permissionNo], conn);
}

// 권한 조회
export async function findPermission(permissionNo: number) {
  const query = `
    SELECT 
      permission_no,
      name,
      description
    FROM permission
    WHERE permission_no = ? AND deleted IS NULL
  `;
  return getRow(query, [permissionNo]);
}
