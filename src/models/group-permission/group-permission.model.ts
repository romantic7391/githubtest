import { exec } from '@/lib/mariadb/query';
import { GroupPermission } from '@/types/permission';
import { PoolConnection } from 'mariadb';

// 그룹 권한 조회
export async function selectGroupPermission(groupNo: number, conn?: PoolConnection) {
  const query = `SELECT * FROM \`groupPermission\` WHERE group_no = ?`;
  return exec(query, [groupNo], conn);
}

// 그룹 권한 추가
export async function insertGroupPermission(dto: GroupPermission, conn?: PoolConnection) {
  const query = `
    INSERT INTO \`groupPermission\` (group_no, permission_no) VALUES (?, ?);
  `;
  const params = [dto.group_no, dto.permission_no];
  return exec(query, params, conn);
}

// 그룹 권한 수정
export async function updateGroupPermission(dto: GroupPermission, conn?: PoolConnection) {
  const query = `
    UPDATE \`groupPermission\` SET group_no = ?, permission_no = ? WHERE group_no = ? AND permission_no = ?
  `;
  const params = [dto.group_no, dto.permission_no, dto.group_no, dto.permission_no];
  return exec(query, params, conn);
}

// 그룹 권한 삭제
export async function deleteGroupPermission(groupNo: number, permissionNo: number, conn?: PoolConnection) {
  const query = `DELETE FROM \`groupPermission\` WHERE group_no = ? AND permission_no = ?`;
  return exec(query, [groupNo, permissionNo], conn);
}
