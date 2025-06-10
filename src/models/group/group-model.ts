import { Group } from '@/types/permission';
import { getRow, getAll, exec } from '@/lib/mariadb/query';
import { Pagination } from '@/types/common';
import { PoolConnection } from 'mariadb';

// 그룹 목록 조회
export async function findGroups(
  pagination: Pagination,
  filters?: {
    name?: string;
    schoolNo?: number;
  },
): Promise<{ groups: Group[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }> {
  const offset = (pagination.page - 1) * pagination.pageSize;
  const conditions = ['g.deleted IS NULL'];
  const params: (string | number)[] = [];

  if (filters?.name) {
    conditions.push('g.name LIKE ?');
    params.push(`%${filters.name}%`);
  }

  if (filters?.schoolNo) {
    conditions.push('g.school_no = ?');
    params.push(filters.schoolNo);
  }

  // 전체 개수 조회
  const countQuery = `
    SELECT COUNT(*) as total
    FROM \`group\` g
    WHERE ${conditions.join(' AND ')}
  `;
  const totalResult = await getRow<{ total: number }>(countQuery, params);
  const total = totalResult?.total || 0;
  const totalPages = Math.ceil(total / pagination.pageSize);

  // 그룹 목록 조회
  const query = `
    SELECT 
      g.group_no,
      g.school_no,
      r.sname as school_name,
      g.name as group_name,
      g.parent_group_no,
      p.name as parent_group_name,
      g.created,
      g.updated
    FROM \`group\` g
    LEFT JOIN \`rnSchool\` r ON g.school_no = r.school_no
    LEFT JOIN \`group\` p ON g.parent_group_no = p.group_no
    WHERE ${conditions.join(' AND ')}
    ORDER BY 
      g.school_no,
      g.parent_group_no,
      g.group_no
    LIMIT ? OFFSET ?
  `;

  const groups = await getAll<Group>(query, [...params, pagination.pageSize, offset]);

  return {
    groups,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages,
    },
  };
}

// 그룹 생성
export async function insertGroup(dto: Group, conn?: PoolConnection): Promise<{ insertId: number }> {
  console.log('Inserting group with data:', dto);

  const query = `
    INSERT INTO \`group\` (parent_group_no, school_no, name)
    VALUES (?, ?, ?)
  `;
  const params: (string | number | null)[] = [dto.parent_group_no ?? null, dto.school_no ?? null, dto.name ?? null];
  console.log('Query:', query);
  console.log('Params:', params);

  const result = await exec(query, params, conn);
  console.log('Insert result:', result);

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
  const params: (string | number | null)[] = [
    dto.parent_group_no ?? null,
    dto.school_no ?? null,
    dto.name ?? null,
    dto.group_no ?? null,
  ];
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
