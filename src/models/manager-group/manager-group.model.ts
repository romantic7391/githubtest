import { exec } from '@/lib/mariadb/query';
import { ManagerGroup } from '@/types/permission';
import { PoolConnection } from 'mariadb';

// 관리자 그룹 생성
export async function insertManagerGroup(dto: ManagerGroup, conn?: PoolConnection) {
  const query = `
    INSERT INTO \`managerGroup\` (no, group_no) VALUES (?, ?);
  `;
  const params = [dto.no, dto.group_no];
  return exec(query, params, conn);
}

// 관리자 그룹 수정
export async function updateManagerGroup(dto: ManagerGroup, conn?: PoolConnection) {
  const query = `
    UPDATE \`managerGroup\` SET no = ?, group_no = ? WHERE no = ? AND group_no = ?
  `;
  const params = [dto.no, dto.group_no, dto.group_no];
  return exec(query, params, conn);
}

// 관리자 그룹 삭제
export async function deleteManagerGroup(no: number, group_no: number, conn?: PoolConnection) {
  const query = `DELETE FROM \`managerGroup\` WHERE no = ? AND group_no = ?`;
  return exec(query, [no, group_no], conn);
}
