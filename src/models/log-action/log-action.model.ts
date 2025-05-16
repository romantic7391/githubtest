import { exec } from '@/lib/mariadb/query';
import { LogActionInsertDto } from '@/interfaces/log-action/log-action.d';

export async function insertLogAction(dto: LogActionInsertDto) {
  const query = `
    INSERT INTO history
      (manager_no, school_no, ip, user_agent, action_type, target_table, target_id, old_values, new_values, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    dto.manager_no,
    dto.school_no,
    dto.ip ?? null,
    dto.user_agent ?? null,
    dto.action_type,
    dto.target_table ?? null,
    dto.target_id ?? null,
    dto.old_values ?? null,
    dto.new_values ?? null,
    dto.reason ?? null,
  ];
  return exec(query, params);
}
