import { exec, getRow, getAll } from '@/lib/mariadb/query';
import { GroupPermission } from '@/types/permission';
import { PoolConnection } from 'mariadb';
import { Pagination } from '@/types/common';

// 그룹 권한 조회
export async function selectGroupPermission(
  pagination: Pagination,
  filters?: {
    groupNo?: number;
    permissionNo?: number;
  },
): Promise<{
  groupPermissions: GroupPermission[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}> {
  console.log('=== selectGroupPermission Start ===');
  console.log('Input:', { pagination, filters });

  const offset = (pagination.page - 1) * pagination.pageSize;
  const conditions = ['gp.deleted IS NULL', 'g.deleted IS NULL', 'p.deleted IS NULL'];
  const params: number[] = [];

  if (filters?.groupNo) {
    conditions.push('gp.group_no = ?');
    params.push(filters.groupNo);
  }

  if (filters?.permissionNo) {
    conditions.push('gp.permission_no = ?');
    params.push(filters.permissionNo);
  }

  console.log('SQL Conditions:', conditions);
  console.log('SQL Params:', params);

  // 전체 개수 조회
  const countQuery = `
    SELECT COUNT(*) as total
    FROM groupPermission gp
    JOIN \`group\` g ON gp.group_no = g.group_no
    JOIN permission p ON gp.permission_no = p.permission_no
    WHERE ${conditions.join(' AND ')}
  `;
  console.log('Count Query:', countQuery);

  const totalResult = await getRow<{ total: number }>(countQuery, params);
  const total = totalResult?.total || 0;
  const totalPages = Math.ceil(total / pagination.pageSize);

  console.log('Count Result:', { total, totalPages });

  // 그룹 권한 목록 조회
  const query = `
    SELECT 
      gp.group_no as groupNo,
      g.name as groupName,
      g.parent_group_no as parentGroupNo,
      pg.name as parentGroupName,
      gp.permission_no as permissionNo,
      p.name as permissionName,
      p.description as permissionDescription  ,
      gp.is_allowed as isAllowed,
      gp.override as override,
      gp.extra_condition as extraCondition,
      gp.extra_limit as extraLimit
    FROM groupPermission gp
    JOIN \`group\` g ON gp.group_no = g.group_no
    LEFT JOIN \`group\` pg ON g.parent_group_no = pg.group_no
    JOIN permission p ON gp.permission_no = p.permission_no
    WHERE ${conditions.join(' AND ')}
    ORDER BY g.parent_group_no, gp.group_no, gp.permission_no
    LIMIT ? OFFSET ?
  `;

  console.log('Select Query:', query);
  console.log('Final Params:', [...params, pagination.pageSize, offset]);

  const groupPermissions = await getAll<GroupPermission>(query, [...params, pagination.pageSize, offset]);

  console.log('Query Result:', { groupPermissions });
  console.log('=== selectGroupPermission End ===');

  return {
    groupPermissions,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages,
    },
  };
}

// 그룹 권한 추가
export async function insertGroupPermission(dto: GroupPermission, conn?: PoolConnection) {
  const query = `
    INSERT INTO \`groupPermission\` (
      group_no, 
      permission_no,
      is_allowed,
      override,
      extra_condition,
      extra_limit
    ) VALUES (?, ?, ?, ?, ?, ?);
  `;
  const params = [dto.groupNo, dto.permissionNo, dto.isAllowed, dto.override, dto.extraCondition, dto.extraLimit];
  return exec(query, params, conn);
}

// 그룹 권한 수정
export async function updateGroupPermission(
  dto: GroupPermission,
  original: { originalGroupNo: number; originalPermissionNo: number },
  conn?: PoolConnection,
) {
  const query = `
    UPDATE \`groupPermission\` 
    SET group_no = ?, 
        permission_no = ?,
        is_allowed = ?,
        override = ?,
        extra_condition = ?,
        extra_limit = ?
    WHERE group_no = ? AND permission_no = ?
  `;
  const params = [
    dto.groupNo,
    dto.permissionNo,
    dto.isAllowed,
    dto.override,
    dto.extraCondition,
    dto.extraLimit,
    original.originalGroupNo,
    original.originalPermissionNo,
  ];
  return exec(query, params, conn);
}

// 그룹 권한 삭제
export async function deleteGroupPermission(groupNo: number, permissionNo: number, conn?: PoolConnection) {
  const query = `DELETE FROM \`groupPermission\` WHERE group_no = ? AND permission_no = ?`;
  return exec(query, [groupNo, permissionNo], conn);
}

// 그룹 권한 조회 (중복 체크용)
export async function findGroupPermission(groupNo: number, permissionNo: number) {
  const query = `
    SELECT 
      COUNT(1) as count
    FROM groupPermission AS gp
    WHERE gp.group_no = ? AND gp.permission_no = ?
    AND gp.deleted IS NULL
  `;

  const result = await getRow<{ count: number }>(query, [groupNo, permissionNo]);
  return result?.count || 0;
}
