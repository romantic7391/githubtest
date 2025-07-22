import { exec, getRow, getAll } from '@/lib/mariadb/query';
import {
  ManagerGroup,
  FindManagerGroupsDto,
  InsertManagerGroupDto,
  UpdateManagerGroupDto,
  DeleteManagerGroupDto,
} from '@/types/permission/manager-group';
import { Pagination } from '@/types/common';
import { PoolConnection } from 'mariadb';
import { AppError } from '@/utils/error.utils';

// 매니저의 그룹 목록 조회
export async function findManagerGroups(
  params: FindManagerGroupsDto,
  pagination: Pagination,
): Promise<{ managerGroups: ManagerGroup[]; total: number }> {
  try {
    const offset = (pagination.page - 1) * pagination.pageSize;
    const conditions = ['mg.deleted IS NULL'];
    const queryParams: (string | number)[] = [];

    // 선택적 필터: 특정 매니저만 조회하고 싶을 때만 사용
    if (params.filters?.managerNo) {
      conditions.push('mg.no = ?');
      queryParams.push(params.filters.managerNo);
    }
    // 필터가 없으면 모든 매니저 그룹 조회 (기본값)

    // 선택적 필터: 특정 그룹만 조회하고 싶을 때만 사용
    if (params.filters?.groupNo) {
      conditions.push('mg.group_no = ?');
      queryParams.push(params.filters.groupNo);
    }

    // 선택적 필터: 특정 학교만 조회하고 싶을 때만 사용
    if (params.filters?.schoolNo) {
      conditions.push('g.school_no = ?');
      queryParams.push(params.filters.schoolNo);
    }

    // 전체 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM managerGroup mg
      JOIN manager m ON mg.no = m.no
      JOIN \`group\` g ON mg.group_no = g.group_no
      JOIN rnSchool r ON g.school_no = r.school_no
      JOIN groupPermission gp ON g.group_no = gp.group_no
      JOIN permission p ON gp.permission_no = p.permission_no
      WHERE ${conditions.join(' AND ')}
      AND g.deleted IS NULL
      AND gp.deleted IS NULL
      AND p.deleted IS NULL
    `;
    const totalResult = await getRow<{ total: number }>(countQuery, queryParams);
    const total = totalResult?.total || 0;

    // 매니저 그룹 목록 조회
    const query = `
      SELECT 
        mg.no as managerNo,
        m.name as managerName,
        r.school_no as schoolNo,
        r.sname as schoolName,
        g.group_no as groupNo,
        g.name as groupName,
        p.permission_no as permissionNo,
        p.name as permissionName,
        gp.is_allowed as isAllowed,
        gp.override as override,
        gp.extra_condition as extraCondition,
        gp.extra_limit as extraLimit
      FROM managerGroup mg
      JOIN manager m ON mg.no = m.no
      JOIN \`group\` g ON mg.group_no = g.group_no
      JOIN rnSchool r ON g.school_no = r.school_no
      JOIN groupPermission gp ON g.group_no = gp.group_no
      JOIN permission p ON gp.permission_no = p.permission_no
      WHERE ${conditions.join(' AND ')}
      AND g.deleted IS NULL
      AND gp.deleted IS NULL
      AND p.deleted IS NULL
      ORDER BY mg.no, g.group_no, p.permission_no
      LIMIT ? OFFSET ?
    `;

    const managerGroups = await getAll<ManagerGroup>(query, [...queryParams, pagination.pageSize, offset]);

    return { managerGroups, total };
  } catch (error) {
    console.error('관리자 그룹 목록 조회 중 오류 발생:', error);
    throw new AppError('관리자 그룹 목록 조회 중 오류가 발생했습니다.', 500);
  }
}

// 특정 관리자 그룹 조회
export async function findManagerGroup(no: number, groupNo: number): Promise<boolean> {
  try {
    const query = `
      SELECT COUNT(1) as count
        from managerGroup as mg
        where mg.no = ?
        and mg.group_no = ?
        and mg.deleted is null;
    `;
    const result = await getRow<{ count: number }>(query, [no, groupNo]);
    return (result?.count ?? 0) > 0;
  } catch (error) {
    console.error('관리자 그룹 조회 중 오류 발생:', error);
    throw new AppError('관리자 그룹 조회 중 오류가 발생했습니다.', 500);
  }
}

// 관리자 그룹 생성
export async function insertManagerGroup(dto: InsertManagerGroupDto, conn?: PoolConnection) {
  try {
    const query = `
      INSERT INTO \`managerGroup\` (no, group_no) VALUES (?, ?);
    `;
    const params = [dto.managerNo, dto.groupNo];
    return exec(query, params, conn);
  } catch (error) {
    console.error('관리자 그룹 생성 중 오류 발생:', error);
    throw new AppError('관리자 그룹 생성 중 오류가 발생했습니다.', 500);
  }
}

// 관리자 그룹 수정
export async function updateManagerGroup(dto: UpdateManagerGroupDto, conn?: PoolConnection) {
  try {
    const query = `
      UPDATE \`managerGroup\` 
      SET no = ?, group_no = ? 
      WHERE no = ? AND group_no = ?
    `;
    const params = [dto.managerNo, dto.groupNo, dto.originalNo, dto.originalGroupNo];
    return exec(query, params, conn);
  } catch (error) {
    console.error('관리자 그룹 수정 중 오류 발생:', error);
    throw new AppError('관리자 그룹 수정 중 오류가 발생했습니다.', 500);
  }
}

// 관리자 그룹 삭제
export async function deleteManagerGroup(dto: DeleteManagerGroupDto, conn?: PoolConnection) {
  try {
    const query = `DELETE FROM \`managerGroup\` WHERE no = ? AND group_no = ?`;
    return exec(query, [dto.managerNo, dto.groupNo], conn);
  } catch (error) {
    console.error('관리자 그룹 삭제 중 오류 발생:', error);
    throw new AppError('관리자 그룹 삭제 중 오류가 발생했습니다.', 500);
  }
}
