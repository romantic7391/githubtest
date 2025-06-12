import { exec, getRow, getAll } from '@/lib/mariadb/query';
import { ManagerGroup } from '@/types/permission';
import { Pagination } from '@/types/common';
import { PoolConnection } from 'mariadb';
import { AppError } from '@/utils/error.utils';

// 매니저의 그룹 목록 조회
export async function findManagerGroups(
  managerNo: number,
  pagination: Pagination,
  filters?: {
    groupNo?: number;
  },
): Promise<{ managerGroups: ManagerGroup[]; total: number }> {
  try {
    const offset = (pagination.page - 1) * pagination.pageSize;
    const conditions = ['mg.deleted IS NULL'];
    const params: (string | number)[] = [];

    // 선택적 필터: 특정 그룹만 조회하고 싶을 때만 사용
    if (filters?.groupNo) {
      conditions.push('mg.group_no = ?');
      params.push(filters.groupNo);
    }

    // 전체 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM managerGroup mg
      JOIN manager m ON mg.no = m.no
      JOIN \`group\` g ON mg.group_no = g.group_no
      WHERE ${conditions.join(' AND ')}
      AND g.deleted IS NULL
    `;
    const totalResult = await getRow<{ total: number }>(countQuery, params);
    const total = totalResult?.total || 0;

    // 매니저 그룹 목록 조회
    const query = `
      SELECT 
        mg.no as managerNo,
        m.name as managerName,
        g.group_no as groupNo,
        g.name as groupName,
        g.school_no as schoolNo,
        s.sname as schoolName
      FROM managerGroup mg
      JOIN manager m ON mg.no = m.no
      JOIN \`group\` g ON mg.group_no = g.group_no
      LEFT JOIN rnSchool s ON g.school_no = s.school_no
      WHERE ${conditions.join(' AND ')}
      AND g.deleted IS NULL
      ORDER BY mg.no, g.group_no
      LIMIT ? OFFSET ?
    `;

    const managerGroups = await getAll<ManagerGroup>(query, [...params, pagination.pageSize, offset]);

    return { managerGroups, total };
  } catch (error) {
    console.error('관리자 그룹 목록 조회 중 오류 발생:', error);
    throw new AppError('관리자 그룹 목록 조회 중 오류가 발생했습니다.', 500, 'MANAGER_GROUP_LIST_ERROR');
  }
}

// 특정 관리자 그룹 조회
export async function findManagerGroup(no: number, groupNo: number): Promise<ManagerGroup | null> {
  try {
    const query = `
      SELECT 
        mg.no as managerNo,
        m.name as managerName,
        g.group_no as groupNo,
        g.name as groupName,
        g.school_no as schoolNo,
        s.sname as schoolName
      FROM managerGroup mg
      JOIN manager m ON mg.no = m.no
      JOIN \`group\` g ON mg.group_no = g.group_no
      LEFT JOIN rnSchool s ON g.school_no = s.school_no
      WHERE mg.no = ? 
        AND mg.group_no = ? 
        AND mg.deleted IS NULL
        AND g.deleted IS NULL
    `;
    return getRow<ManagerGroup>(query, [no, groupNo]);
  } catch (error) {
    console.error('관리자 그룹 조회 중 오류 발생:', error);
    throw new AppError('관리자 그룹 조회 중 오류가 발생했습니다.', 500, 'MANAGER_GROUP_FIND_ERROR');
  }
}

// 관리자 그룹 생성
export async function insertManagerGroup(dto: ManagerGroup, conn?: PoolConnection) {
  try {
    const query = `
      INSERT INTO \`managerGroup\` (no, group_no) VALUES (?, ?);
    `;
    const params = [dto.no, dto.groupNo];
    return exec(query, params, conn);
  } catch (error) {
    console.error('관리자 그룹 생성 중 오류 발생:', error);
    throw new AppError('관리자 그룹 생성 중 오류가 발생했습니다.', 500, 'MANAGER_GROUP_CREATE_ERROR');
  }
}

// 관리자 그룹 수정
export async function updateManagerGroup(
  dto: ManagerGroup,
  originalNo: number,
  originalGroupNo: number,
  conn?: PoolConnection,
) {
  try {
    const query = `
      UPDATE \`managerGroup\` 
      SET no = ?, group_no = ? 
      WHERE no = ? AND group_no = ?
    `;
    const params = [dto.no, dto.groupNo, originalNo, originalGroupNo];
    return exec(query, params, conn);
  } catch (error) {
    console.error('관리자 그룹 수정 중 오류 발생:', error);
    throw new AppError('관리자 그룹 수정 중 오류가 발생했습니다.', 500, 'MANAGER_GROUP_UPDATE_ERROR');
  }
}

// 관리자 그룹 삭제
export async function deleteManagerGroup(no: number, groupNo: number, conn?: PoolConnection) {
  try {
    const query = `DELETE FROM \`managerGroup\` WHERE no = ? AND group_no = ?`;
    return exec(query, [no, groupNo], conn);
  } catch (error) {
    console.error('관리자 그룹 삭제 중 오류 발생:', error);
    throw new AppError('관리자 그룹 삭제 중 오류가 발생했습니다.', 500, 'MANAGER_GROUP_DELETE_ERROR');
  }
}
