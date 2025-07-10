// import { Pagination } from '@/types/common';
import { Group } from '@/types/permission/group';
import { getRow, getAll, exec } from '@/lib/mariadb/query';
import { PoolConnection } from 'mariadb';
// import { AppError } from '@/utils/error.utils';
import {
  FindGroupsDto,
  InsertGroupDto,
  UpdateGroupDto,
  DeleteGroupDto,
  FindGroupDto,
  CheckGroupExistsDto,
  CheckGroupDuplicateDto,
} from '@/types/permission/group';

// 그룹 목록 조회
export async function findGroups(dto: FindGroupsDto): Promise<{ groups: Group[]; total: number }> {
  const offset = (dto.pagination.page - 1) * dto.pagination.pageSize;
  const conditions = ['g.deleted IS NULL'];
  const params: (string | number | null)[] = [];

  if (dto.filters?.name) {
    conditions.push('g.name LIKE ?');
    params.push(`%${dto.filters.name}%`);
  }

  // schoolNo가 undefined가 아닐 때만 조건 추가
  if (dto.filters?.schoolNo !== undefined) {
    if (dto.filters.schoolNo === null) {
      conditions.push('g.school_no IS NULL');
    } else {
      conditions.push('g.school_no = ?');
      params.push(dto.filters.schoolNo);
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
      g.group_no as groupNo,
      g.school_no as schoolNo,
      r.sname as schoolName,
      g.name as name,
      g.parent_group_no as parentGroupNo,
      p.name as parentGroupName,
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

  const groups = await getAll<Group>(query, [...params, dto.pagination.pageSize, offset]);

  return { groups, total };
}

// 그룹 생성
export async function insertGroup(dto: InsertGroupDto, conn?: PoolConnection): Promise<{ insertId: number }> {
  const query = `
    INSERT INTO \`group\` (
      name, 
      school_no, 
      parent_group_no
    ) VALUES (?, ?, ?)
  `;
  const params = [dto.name, dto.schoolNo, dto.parentGroupNo];
  const result = await exec(query, params, conn);
  return { insertId: result.insertId };
}

// 그룹 수정
export async function updateGroup(dto: UpdateGroupDto, conn?: PoolConnection): Promise<void> {
  const updates: string[] = [];
  const params: (string | number | null)[] = [];

  if (dto.name !== undefined) {
    updates.push('name = ?');
    params.push(dto.name);
  }
  if (dto.schoolNo !== undefined) {
    updates.push('school_no = ?');
    params.push(dto.schoolNo);
  }
  if (dto.parentGroupNo !== undefined) {
    updates.push('parent_group_no = ?');
    params.push(dto.parentGroupNo);
  }

  if (updates.length === 0) {
    return; // 변경할 내용이 없으면 리턴
  }

  const query = `
    UPDATE \`group\` 
    SET ${updates.join(', ')}
    WHERE group_no = ? 
      AND deleted IS NULL
  `;
  params.push(dto.groupNo);
  await exec(query, params, conn);
}

// 그룹 삭제
export async function deleteGroup(dto: DeleteGroupDto, conn?: PoolConnection): Promise<void> {
  const query = `DELETE FROM \`group\` WHERE group_no = ?`;
  await exec(query, [dto.groupNo], conn);
}

// 그룹 조회
export async function findGroup(dto: FindGroupDto): Promise<Group | null> {
  const query = `
    SELECT 
      g.group_no as groupNo,
      g.school_no as schoolNo,
      r.sname as schoolName,
      g.name as name,
      g.parent_group_no as parentGroupNo,
      p.name as parentGroupName,
      g.created,
      g.updated
    FROM \`group\` g
    LEFT JOIN \`rnSchool\` r ON g.school_no = r.school_no
    LEFT JOIN \`group\` p ON g.parent_group_no = p.group_no
    WHERE g.group_no = ? 
      AND g.deleted IS NULL
  `;
  return getRow<Group>(query, [dto.groupNo]);
}

// 그룹 존재 여부 확인
export async function checkGroupExists(dto: CheckGroupExistsDto): Promise<boolean> {
  const query = `
    SELECT 1
    FROM \`group\` as g
    WHERE g.group_no = ?
      AND g.deleted IS NULL
  `;
  const result = await getRow<{ '1': number }>(query, [dto.groupNo]);
  return !!result;
}

// 그룹 중복 체크
export async function checkGroupDuplicate(dto: CheckGroupDuplicateDto): Promise<{ count: number } | null> {
  const query = `
    SELECT COUNT(1) as count
    FROM \`group\` as g
    WHERE g.school_no = ?
      AND g.name = ?
      AND g.group_no != ?
      AND g.deleted IS NULL
  `;
  const params = [dto.schoolNo, dto.name, dto.groupNo ?? 0]; // groupNo가 없으면 0으로 처리
  return getRow<{ count: number }>(query, params);
}
