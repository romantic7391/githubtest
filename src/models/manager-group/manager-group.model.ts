import { exec } from '@/lib/mariadb/query';
import { ManagerGroup } from '@/types/permission';
import { getRow, getAll } from '@/lib/mariadb/query';
import { Pagination } from '@/types/common';
import { PoolConnection } from 'mariadb';

// 매니저의 그룹 목록 조회
export async function findManagerGroups(
  managerNo: number,
  pagination: Pagination,
  filters?: {
    groupNo?: number;
  },
): Promise<{ managerGroups: ManagerGroup[]; total: number }> {
  const offset = (pagination.page - 1) * pagination.pageSize;
  const conditions = ['no = ?', 'deleted IS NULL'];
  const params: (string | number)[] = [managerNo];

  // 선택적 필터: 특정 그룹만 조회하고 싶을 때만 사용
  if (filters?.groupNo) {
    conditions.push('group_no = ?');
    params.push(filters.groupNo);
  }

  // 전체 개수 조회
  const countQuery = `
    SELECT COUNT(*) as total
    FROM managerGroup
    WHERE ${conditions.join(' AND ')}
  `;
  const totalResult = await getRow<{ total: number }>(countQuery, params);
  const total = totalResult?.total || 0;

  // 매니저 그룹 목록 조회
  const query = `
    SELECT 
      no as manager_no,
      group_no as groupNo,
      created,
      updated
    FROM managerGroup
    WHERE ${conditions.join(' AND ')}
    ORDER BY group_no ASC
    LIMIT ? OFFSET ?
  `;

  const managerGroups = await getAll<ManagerGroup>(query, [...params, pagination.pageSize, offset]);

  return { managerGroups, total };
}

// 관리자 그룹 생성
export async function insertManagerGroup(dto: ManagerGroup, conn?: PoolConnection) {
  const query = `
    INSERT INTO \`managerGroup\` (no, group_no) VALUES (?, ?);
  `;
  const params = [dto.no, dto.groupNo];
  return exec(query, params, conn);
}

// 관리자 그룹 수정
export async function updateManagerGroup(
  dto: ManagerGroup,
  originalNo: number,
  originalGroupNo: number,
  conn?: PoolConnection,
) {
  const query = `
    UPDATE \`managerGroup\` 
    SET no = ?, group_no = ? 
    WHERE no = ? AND group_no = ?
  `;
  const params = [dto.no, dto.groupNo, originalNo, originalGroupNo];
  return exec(query, params, conn);
}

// 관리자 그룹 삭제
export async function deleteManagerGroup(no: number, groupNo: number, conn?: PoolConnection) {
  const query = `DELETE FROM \`managerGroup\` WHERE no = ? AND group_no = ?`;
  return exec(query, [no, groupNo], conn);
}
