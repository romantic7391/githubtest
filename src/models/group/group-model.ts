import { Group } from '@/types/permission';
import { getRow, getAll, exec } from '@/lib/mariadb/query';
import { Pagination } from '@/types/common';
import { PoolConnection } from 'mariadb';

// 그룹 조회
export async function findGroup(groupNo: number): Promise<Group | null> {
  const query = `
    SELECT 
      group_no,
      parent_group_no,
      school_no,
      name
    FROM \`group\`
    WHERE group_no = ? AND deleted IS NULL
  `;
  return getRow<Group>(query, [groupNo]);
}

// 그룹 목록 조회
export async function findGroups(
  pagination: Pagination,
  filters?: {
    name?: string;
    schoolNo?: number;
  },
): Promise<{ groups: Group[]; total: number }> {
  const offset = (pagination.page - 1) * pagination.pageSize;
  const conditions = ['deleted IS NULL'];
  const params: (string | number)[] = [];

  if (filters?.name) {
    conditions.push('name LIKE ?');
    params.push(`%${filters.name}%`);
  }

  if (filters?.schoolNo) {
    conditions.push('school_no = ?');
    params.push(filters.schoolNo);
  }

  // 전체 개수 조회
  const countQuery = `
    SELECT COUNT(*) as total
    FROM \`group\`
    WHERE ${conditions.join(' AND ')}
  `;
  const totalResult = await getRow<{ total: number }>(countQuery, params);
  const total = totalResult?.total || 0;

  // 그룹 목록 조회
  const query = `
    SELECT 
      group_no,
      parent_group_no,
      school_no,
      name
    FROM \`group\`
    WHERE ${conditions.join(' AND ')}
    ORDER BY group_no ASC
    LIMIT ? OFFSET ?
  `;

  const groups = await getAll<Group>(query, [...params, pagination.pageSize, offset]);

  return { groups, total };
}

// 그룹 생성
export async function insertGroup(dto: Group, conn?: PoolConnection): Promise<{ insertId: number }> {
  const query = `
    INSERT INTO \`group\` (parent_group_no, school_no, name)
    VALUES (?, ?, ?)
  `;
  const params = [dto.parent_group_no, dto.school_no, dto.name];
  const result = await exec(query, params, conn);
  return { insertId: result.insertId };
}

// 그룹 수정
export async function updateGroup(dto: Group, conn?: PoolConnection): Promise<void> {
  const query = `
    UPDATE \`group\`
    SET parent_group_no = ?,
        school_no = ?,
        name = ?
    WHERE group_no = ? AND deleted IS NULL
  `;
  const params = [dto.parent_group_no, dto.school_no, dto.name, dto.group_no];
  await exec(query, params, conn);
}

// 그룹 삭제
export async function deleteGroup(groupNo: number, conn?: PoolConnection): Promise<void> {
  const query = `
    UPDATE \`group\`
    SET deleted = NOW()
    WHERE group_no = ? AND deleted IS NULL
  `;
  await exec(query, [groupNo], conn);
}
