import { exec } from '@/lib/mariadb/query';
import { History } from '@/types/history';
import type { PoolConnection } from 'mariadb';

export async function insertLogAction(dto: History, conn?: PoolConnection) {
  const query = `
    INSERT INTO history
      (manager_no, school_no, ip, user_agent, action_type, target_table, target_id, old_values, new_values, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    dto.managerNo,
    dto.schoolNo,
    dto.ip,
    dto.userAgent,
    dto.actionType,
    dto.targetTable,
    dto.targetId,
    dto.oldValues,
    dto.newValues,
    dto.reason,
  ];
  return exec(query, params, conn);
}
