import { exec } from '@/lib/mariadb/query';
import { GroupPermission } from '@/types/permission';

export async function insertGroupPermission(dto: GroupPermission) {
  const query = `
    INSERT INTO \`groupPermission\` (group_no, permission_no) VALUES (?, ?);
  `;
  const params = [dto.group_no, dto.permission_no];
  return exec(query, params);
}

export async function updateGroupPermission(dto: GroupPermission) {
  const query = `
    UPDATE \`groupPermission\` SET group_no = ?, permission_no = ? WHERE group_no = ? AND permission_no = ?
  `;
  const params = [dto.group_no, dto.permission_no, dto.group_no, dto.permission_no];
  return exec(query, params);
}

export async function deleteGroupPermission(groupNo: number, permissionNo: number) {
  const query = `DELETE FROM \`groupPermission\` WHERE group_no = ? AND permission_no = ?`;
  return exec(query, [groupNo, permissionNo]);
}
