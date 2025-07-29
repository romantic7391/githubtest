import { ManagerSignInHistory } from '@/types/manager-signin-history';
import { exec, getRow } from '@/lib/mariadb/query';
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

export async function selectLastSignInHistory(managerNo: number, remoteAddr: number, conn?: PoolConnection) {
  const query = `
    SELECT
      idx as historyNo
      , no as managerNo
      , login_time as signInTime
      , logout_time as signOutTime
      , success
      , remote_addr as remoteAddr
      , login_id as signInId
    FROM manager_login_history
    WHERE no = ?
      AND remote_addr = ?
    ORDER BY login_time DESC
    LIMIT 1;
  `;
  const params = [managerNo, remoteAddr];
  return await getRow(query, params, undefined, conn);
}

export async function updateSignInHistory(dto: Required<ManagerSignInHistory>, conn?: PoolConnection) {
  const query = `
    UPDATE manager_login_history
    SET
      logout_time = ?
      , success = ?
    WHERE idx = ?
  `;
  const params = [dto.signOutTime, dto.success, dto.historyNo];
  return await exec(query, params, conn);
}
