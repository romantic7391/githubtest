import { Group } from '@/types/permission';
import { exec } from '@/lib/mariadb/query';
import { PoolConnection } from 'mariadb';

// 그룹 생성
export async function insertGroup(dto: Omit<Group, 'group_no'>, conn?: PoolConnection) {
  const query = `
    INSERT INTO \`group\` (school_no, name, parent_group_no) VALUES (?, ?, ?);
  `;
  const params = [dto.school_no, dto.name, dto.parent_group_no];
  return exec(query, params, conn);
}

// 그룹 수정
export async function updateGroup(dto: Group, connection?: PoolConnection) {
  const query = `
    UPDATE \`group\` SET school_no = ?, name = ?, parent_group_no = ? WHERE group_no = ?
  `;
  const params = [dto.school_no, dto.name, dto.parent_group_no, dto.group_no];
  return exec(query, params, connection);
}

// 그룹 삭제
export async function deleteGroup(groupNo: number, connection?: PoolConnection) {
  const query = `DELETE FROM \`group\` WHERE group_no = ?`;
  return exec(query, [groupNo], connection);
}
