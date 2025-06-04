import { exec, getRow } from '@/lib/mariadb/query';
import { Group } from '@/types/permission';

export async function findGroupByGroupNo(groupNo: number): Promise<Group | null> {
  const query = `
    SELECT * FROM \`group\` WHERE group_no = ?
  `;
  return getRow<Group>(query, [groupNo]);
}

export async function insertGroup(dto: Group) {
  const query = `
    INSERT INTO \`group\` (school_no, name, parent_group_no) VALUES (?, ?, ?);
  `;
  const params = [dto.school_no || null, dto.name, dto.parent_group_no || null];
  return exec(query, params);
}

export async function updateGroup(dto: Group) {
  const query = `
    UPDATE \`group\` SET school_no = ?, name = ?, parent_group_no = ? WHERE group_no = ?
  `;
  const params = [dto.school_no ?? null, dto.name, dto.parent_group_no ?? null, dto.group_no];
  return exec(query, params);
}

export async function deleteGroup(groupNo: number) {
  const query = `DELETE FROM \`group\` WHERE group_no = ?`;
  return exec(query, [groupNo]);
}
