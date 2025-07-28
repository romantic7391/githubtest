import { ManagerSignInHistory } from '@/types/manager-signin-history';
import { exec } from '@/lib/mariadb/query';
import type { PoolConnection } from 'mariadb';

export async function insertSignInLogAction(dto: ManagerSignInHistory, conn?: PoolConnection) {
  const query = `
    INSERT INTO manager_login_history
      (no, login_time, logout_time, success, remote_addr, login_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [dto.managerNo, dto.signInTime, dto.signOutTime, dto.success, dto.remoteAddr, dto.signInId];
  return await exec(query, params, conn);
}
