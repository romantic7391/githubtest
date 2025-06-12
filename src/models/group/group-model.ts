import { Group } from '@/types/permission';
import { Pagination } from '@/types/common';
import { getRow, getAll, exec } from '@/lib/mariadb/query';
import { PoolConnection } from 'mariadb';
// import { AppError } from '@/utils/error.utils';
import { groupNameSchema, schoolNoSchema, groupNoSchema } from '@/types/permission';

// 그룹 목록 조회
export async function findGroups(
  pagination: Pagination,
  filters?: {
    name?: string;
    schoolNo?: number | null;
  },
): Promise<{ groups: Group[]; total: number }> {
  const offset = (pagination.page - 1) * pagination.pageSize;
  const conditions = ['g.deleted IS NULL'];
  const params: (string | number | null)[] = [];

  if (filters?.name) {
    conditions.push('g.name LIKE ?');
    params.push(`%${filters.name}%`);
  }

  // schoolNo가 undefined가 아닐 때만 조건 추가
  if (filters?.schoolNo !== undefined) {
    if (filters.schoolNo === null) {
      conditions.push('g.school_no IS NULL');
    } else {
      conditions.push('g.school_no = ?');
      params.push(filters.schoolNo);
    }
  }

  // 전체 개수 조회
  const countQuery = `
    SELECT COUNT(*) as total
    FROM \`group\` g
    WHERE ${conditions.join(' AND ')}
  `;
  const totalResult = await getRow<{ total: number }>(countQuery, params);
  const total = totalResult?.total || 0;

  // 그룹 목록 조회
  const query = `
    SELECT 
      g.group_no as group_no,
      g.school_no as school_no,
      r.sname as school_name,
      g.name as name,
      g.parent_group_no as parent_group_no,
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

  return { groups, total };
}

// 그룹 생성
export async function insertGroup(
  dto: {
    name: string;
    school_no: number | null;
    parent_group_no: number | null;
  },
  conn?: PoolConnection,
): Promise<{ insertId: number }> {
  // 파라미터 검증
  const validatedName = groupNameSchema.parse(dto.name);
  const validatedSchoolNo = schoolNoSchema.parse(dto.school_no);
  const validatedParentGroupNo = schoolNoSchema.parse(dto.parent_group_no);

  const query = `
    INSERT INTO \`group\` (
      name, 
      school_no, 
      parent_group_no
    ) VALUES (?, ?, ?)
  `;
  const params = [validatedName, validatedSchoolNo, validatedParentGroupNo];
  const result = await exec(query, params, conn);
  return { insertId: result.insertId };
}

// 그룹 수정
export async function updateGroup(dto: Group, conn?: PoolConnection): Promise<void> {
  // 파라미터 검증
  const validatedName = groupNameSchema.parse(dto.name);
  const validatedSchoolNo = schoolNoSchema.parse(dto.school_no);
  const validatedParentGroupNo = schoolNoSchema.parse(dto.parent_group_no);
  const validatedGroupNo = groupNoSchema.parse(dto.group_no);

  const query = `
    UPDATE \`group\` 
    SET 
      name = ?, 
      school_no = ?, 
      parent_group_no = ? 
    WHERE group_no = ? 
      AND deleted IS NULL
  `;
  const params = [validatedName, validatedSchoolNo, validatedParentGroupNo, validatedGroupNo];
  await exec(query, params, conn);
}

// 그룹 삭제
export async function deleteGroup(groupNo: number, conn?: PoolConnection): Promise<void> {
  // 파라미터 검증
  const validatedGroupNo = groupNoSchema.parse(groupNo);

  const query = `DELETE FROM \`group\` WHERE group_no = ?`;
  await exec(query, [validatedGroupNo], conn);
}

// 그룹 조회
export async function findGroup(groupNo: number): Promise<Group | null> {
  // 파라미터 검증
  const validatedGroupNo = groupNoSchema.parse(groupNo);

  const query = `
    SELECT 
      g.group_no as group_no,
      g.school_no as school_no,
      r.sname as school_name,
      g.name as name,
      g.parent_group_no as parent_group_no,
      p.name as parent_group_name,
      g.created,
      g.updated
    FROM \`group\` g
    LEFT JOIN \`rnSchool\` r ON g.school_no = r.school_no
    LEFT JOIN \`group\` p ON g.parent_group_no = p.group_no
    WHERE g.group_no = ? 
      AND g.deleted IS NULL
  `;
  return getRow<Group>(query, [validatedGroupNo]);
}

// 그룹 존재 여부 확인
export async function checkGroupExists(groupNo: number) {
  // 파라미터 검증
  const validatedGroupNo = groupNoSchema.parse(groupNo);

  const query = `
    SELECT COUNT(1) as count
    FROM \`group\` as g
    WHERE g.group_no = ?
      AND g.deleted IS NULL
  `;
  return getRow<{ count: number }>(query, [validatedGroupNo]);
}

// 그룹 중복 체크
export async function checkGroupDuplicate(name: string, schoolNo: number | null) {
  // 파라미터 검증
  const validatedName = groupNameSchema.parse(name);
  const validatedSchoolNo = schoolNoSchema.parse(schoolNo);

  const query = `
    SELECT COUNT(1) as count
    FROM \`group\` as g
    WHERE g.school_no = ?
      AND g.name = ?
      AND deleted IS NULL
  `;
  return getRow<{ count: number }>(query, [validatedSchoolNo, validatedName]);
}
