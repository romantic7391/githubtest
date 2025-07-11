import { exec, getRow, getAll } from '@/lib/mariadb/query';
import {
  GroupPermissionDetail,
  FindGroupPermissionDto,
  InsertGroupPermissionDto,
  UpdateGroupPermissionDto,
  DeleteGroupPermissionDto,
} from '@/types/permission/group-permission';
import { PoolConnection } from 'mariadb';
import { Pagination } from '@/types/common';
import { AppError } from '@/utils/error.utils';

// 그룹 권한 조회
export async function selectGroupPermission(
  pagination: Pagination,
  filters?: {
    groupNo?: number;
    permissionNo?: number;
    schoolNo?: number;
  },
): Promise<{
  groupPermissions: GroupPermissionDetail[];
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
  const params: (number | null)[] = [];

  if (filters?.groupNo) {
    conditions.push('gp.group_no = ?');
    params.push(filters.groupNo);
  }

  if (filters?.permissionNo) {
    conditions.push('gp.permission_no = ?');
    params.push(filters.permissionNo);
  }
  if (filters?.schoolNo !== undefined && filters?.schoolNo !== null) {
    conditions.push('g.school_no = ?');
    params.push(filters.schoolNo);
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
      r.school_no as schoolNo,
      r.sname as schoolName,
      g.name as groupName,
      g.parent_group_no as parentGroupNo,
      pg.name as parentGroupName,
      gp.permission_no as permissionNo,
      p.name as permissionName,
      p.description as permissionDescription,
      gp.is_allowed as isAllowed,
      gp.override as override,
      gp.extra_condition as extraCondition,
      gp.extra_limit as extraLimit
    FROM groupPermission gp
    JOIN \`group\` g ON gp.group_no = g.group_no
    LEFT JOIN \`group\` pg ON g.parent_group_no = pg.group_no
    JOIN permission p ON gp.permission_no = p.permission_no
    LEFT JOIN rnSchool r ON g.school_no = r.school_no
    WHERE ${conditions.join(' AND ')}
    ORDER BY g.parent_group_no, gp.group_no, gp.permission_no
    LIMIT ? OFFSET ?
  `;

  console.log('Select Query:', query);
  console.log('Final Params:', [...params, pagination.pageSize, offset]);

  const groupPermissions = await getAll<GroupPermissionDetail>(query, [...params, pagination.pageSize, offset]);

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
export async function insertGroupPermission(dto: InsertGroupPermissionDto, conn?: PoolConnection) {
  try {
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
  } catch (error) {
    console.error('그룹 권한 생성 중 오류 발생:', error);
    throw new AppError('그룹 권한 생성 중 오류가 발생했습니다.', 500);
  }
}

// 그룹 권한 수정
export async function updateGroupPermission(dto: UpdateGroupPermissionDto, conn?: PoolConnection) {
  try {
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
      dto.originalGroupNo,
      dto.originalPermissionNo,
    ];
    return exec(query, params, conn);
  } catch (error) {
    console.error('그룹 권한 수정 중 오류 발생:', error);
    throw new AppError('그룹 권한 수정 중 오류가 발생했습니다.', 500);
  }
}

// 그룹 권한 삭제
export async function deleteGroupPermission(dto: DeleteGroupPermissionDto, conn?: PoolConnection) {
  try {
    const query = `DELETE FROM \`groupPermission\` WHERE group_no = ? AND permission_no = ?`;
    return exec(query, [dto.groupNo, dto.permissionNo], conn);
  } catch (error) {
    console.error('그룹 권한 삭제 중 오류 발생:', error);
    throw new AppError('그룹 권한 삭제 중 오류가 발생했습니다.', 500);
  }
}

// 그룹 권한 조회 (중복 체크용)
export async function findGroupPermission(dto: FindGroupPermissionDto): Promise<boolean> {
  try {
    const query = `
      SELECT 
        COUNT(1) as count
      FROM groupPermission AS gp
      WHERE gp.group_no = ? AND gp.permission_no = ?
      AND gp.deleted IS NULL
    `;

    const result = await getRow<{ count: number }>(query, [dto.groupNo, dto.permissionNo]);
    return (result?.count ?? 0) > 0;
  } catch (error) {
    console.error('그룹 권한 조회 중 오류 발생:', error);
    throw new AppError('그룹 권한 조회 중 오류가 발생했습니다.', 500);
  }
}
