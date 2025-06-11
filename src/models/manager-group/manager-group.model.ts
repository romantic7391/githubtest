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
    schoolNo?: number;
  },
): Promise<{ managerGroups: ManagerGroup[]; total: number }> {
  const offset = (pagination.page - 1) * pagination.pageSize;
  const conditions = ['mg.deleted IS NULL'];
  const params: (string | number)[] = [];

  // 선택적 필터: 특정 그룹만 조회하고 싶을 때만 사용
  if (filters?.groupNo) {
    conditions.push('mg.group_no = ?');
    params.push(filters.groupNo);
  }

  // 학교 번호로 필터링
  if (filters?.schoolNo) {
    conditions.push('r.school_no = ?');
    params.push(filters.schoolNo);
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
  const totalResult = await getRow<{ total: number }>(countQuery, params);
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
