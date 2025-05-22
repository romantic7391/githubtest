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
    dto.manager_no,
    dto.school_no,
    dto.ip,
    dto.user_agent,
    dto.action_type,
    dto.target_table,
    dto.target_id,
    dto.old_values,
    dto.new_values,
    dto.reason,
  ];
  return exec(query, params, conn);
}
