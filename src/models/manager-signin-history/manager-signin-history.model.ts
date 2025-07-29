import {
  ManagerSignInHistory,
  SignInHistoryResponseItem,
  SelectSignInHistoriesRequestDto,
} from '@/types/manager-signin-history';
import { exec, getRow, getAll } from '@/lib/mariadb/query';
import type { PoolConnection } from 'mariadb';
import ip from 'ip';

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

export async function selectSignInHistories(dto: SelectSignInHistoriesRequestDto, conn?: PoolConnection) {
  try {
    const offset = (dto.pagination.page - 1) * dto.pagination.pageSize;
    const conditions = ['1=1'];
    const params: (string | number)[] = [];

    const filters = dto.filters;
    if (filters.startDate) {
      conditions.push(`mlh.login_time >= ?`);
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push(`mlh.login_time <= ?`);
      params.push(filters.endDate);
    }
    if (filters.historyNo) {
      conditions.push(`mlh.idx = ?`);
      params.push(filters.historyNo);
    }
    if (filters.success) {
      conditions.push(`mlh.success = ?`);
      params.push(filters.success);
    }
    if (filters.signInId) {
      conditions.push(`m.login_id = ?`);
      params.push(filters.signInId);
    }
    if (filters.managerName) {
      conditions.push(`m.name LIKE ?`);
      params.push(`%${filters.managerName}%`);
    }
    if (filters.schoolName) {
      conditions.push(`s.sname LIKE ?`);
      params.push(`%${filters.schoolName}%`);
    }
    if (filters.schoolCode) {
      conditions.push(`s.scode = ?`);
      params.push(filters.schoolCode);
    }
    if (filters.ip) {
      const ipLong = ip.toLong(filters.ip);
      conditions.push(`mlh.remote_addr = ?`);
      params.push(ipLong);
    }

    const countQuery = `
      SELECT
        COUNT(*) AS total
      FROM manager_login_history AS mlh
      LEFT JOIN manager AS m ON mlh.no = m.no
      LEFT JOIN rnSchool AS s ON m.school_no = s.school_no
      WHERE ${conditions.join(' AND ')}
    `;
    const totalResult = await getRow<{ total: number }>(countQuery, params, undefined, conn);
    const total = totalResult?.total || 0;

    const selectQuery = `
      SELECT
        mlh.idx AS historyNo
        , mlh.no AS managerNo
        , mlh.login_time AS signInTime
        , mlh.logout_time AS signOutTime
        , mlh.success
        , mlh.remote_addr AS remoteAddr
        , mlh.login_id AS signInId
        , m.name AS managerName
        , m.school_no AS schoolNo
        , s.scode AS schoolCode
        , s.sname AS schoolName
      FROM manager_login_history AS mlh
      LEFT JOIN manager AS m ON mlh.no = m.no
      LEFT JOIN rnSchool AS s ON m.school_no = s.school_no
      WHERE ${conditions.join(' AND ')}
      ORDER BY mlh.idx ${(dto.filters.order ?? 'desc').toUpperCase()}
      LIMIT ${offset}, ${dto.pagination.pageSize}
    `;
    const histories = await getAll<SignInHistoryResponseItem>(selectQuery, params, undefined, conn);

    // IP 주소 변환
    const historiesWithIp = histories.map((history) => ({
      ...history,
      ip: ip.fromLong(history.remoteAddr) || '',
    }));

    return {
      histories: historiesWithIp,
      total,
    };
  } catch (error) {
    throw error;
  }
}

export async function selectSignInHistory(historyNo: number, conn?: PoolConnection) {
  try {
    const query = `
      SELECT
        mlh.idx AS historyNo
        , mlh.no AS managerNo
        , mlh.login_time AS signInTime
        , mlh.logout_time AS signOutTime
        , mlh.success
        , mlh.remote_addr AS remoteAddr
        , mlh.login_id AS signInId
        , m.name AS managerName
        , m.school_no AS schoolNo
        , s.scode AS schoolCode
        , s.sname AS schoolName
      FROM manager_login_history AS mlh
      LEFT JOIN manager AS m ON mlh.no = m.no
      LEFT JOIN rnSchool AS s ON m.school_no = s.school_no
      WHERE mlh.idx = ?
    `;
    const history = await getRow<SignInHistoryResponseItem>(query, [historyNo], undefined, conn);

    if (history) {
      return {
        ...history,
        ip: ip.fromLong(history.remoteAddr) || '',
      };
    }

    return history;
  } catch (error) {
    throw error;
  }
}
