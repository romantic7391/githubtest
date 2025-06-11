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
      gp.group_no,
      g.name as group_name,
      g.parent_group_no,
      pg.name as parent_group_name,
      gp.permission_no,
      p.name as permission_name,
      p.description as permission_description,
      gp.is_allowed,
      gp.override,
      gp.extra_condition,
      gp.extra_limit
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
