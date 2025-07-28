import type { PoolConnection } from 'mariadb';
import type { HistoryWithNo, SelectHistoriesRequestDto } from '@/types/history';
import { getRow, getAll } from '@/lib/mariadb/query';

export async function selectHistories(dto: SelectHistoriesRequestDto, conn?: PoolConnection) {
  try {
    const offset = (dto.pagination.page - 1) * dto.pagination.pageSize;
    const conditions = ['1=1'];
    const joins: string[] = [];
    const params: (string | number)[] = [];

    const filters = dto.filters;
    if (filters.startDate) {
      conditions.push(`h.created >= ?`);
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push(`h.created <= ?`);
      params.push(filters.endDate);
    }
    if (filters.actionTypes && filters.actionTypes.length > 0) {
      conditions.push(`h.action_type IN (${filters.actionTypes.map(() => `?`).join(',')})`);
      params.push(...filters.actionTypes);
    }
    if (filters.targetTables && filters.targetTables.length > 0) {
      conditions.push(`h.target_table IN (${filters.targetTables.map(() => `?`).join(',')})`);
      params.push(...filters.targetTables);
    }
    if (filters.targetId) {
      conditions.push(`h.target_id = ?`);
      params.push(filters.targetId);
    }
    if (filters.ip) {
      conditions.push(`h.ip = ?`);
      params.push(filters.ip);
    }
    if (filters.userAgent) {
      conditions.push(`h.user_agent = ?`);
      params.push(filters.userAgent);
    }
    if (filters.reason) {
      conditions.push(`h.reason LIKE ?`);
      params.push(`%${filters.reason}%`);
    }
    if (filters.managerName) {
      conditions.push(`m.name LIKE ?`);
      params.push(`%${filters.managerName}%`);
    }
    if (filters.managerSignInId) {
      conditions.push(`m.login_id = ?`);
      params.push(filters.managerSignInId);
    }
    if (filters.schoolName) {
      conditions.push(`s.sname LIKE ?`);
      params.push(`%${filters.schoolName}%`);
    }
    if (filters.schoolCode) {
      conditions.push(`s.scode = ?`);
      params.push(filters.schoolCode);
    }

    const countQuery = `
      SELECT
        COUNT(*) AS total
      FROM history AS h
      LEFT JOIN rnSchool AS s ON h.school_no = s.school_no
      LEFT JOIN manager AS m ON h.manager_no = m.no
      ${joins.join('\n')}
      WHERE ${conditions.join(' AND ')}
    `;
    const totalResult = await getRow<{ total: number }>(countQuery, params, undefined, conn);
    const total = totalResult?.total || 0;

    const selectQuery = `
      SELECT
        h.log_no AS historyNo
        , h.manager_no AS managerNo
        , h.school_no AS schoolNo
        , h.ip
        , h.user_agent AS userAgent
        , h.action_type AS actionType
        , h.target_table AS targetTable
        , h.target_id AS targetId
        , h.old_values AS oldValues
        , h.new_values AS newValues
        , h.reason
        , h.created
        , s.scode AS schoolCode
        , s.sname AS schoolName
        , m.login_id AS managerSignInId
        , m.name AS managerName
      FROM history AS h
      LEFT JOIN rnSchool AS s ON h.school_no = s.school_no
      LEFT JOIN manager AS m ON h.manager_no = m.no
      ${joins.join('\n')}
      WHERE ${conditions.join('\n\t AND ')}
      ORDER BY h.log_no ${(dto.filters.order ?? 'desc').toUpperCase()}
      LIMIT ${offset}, ${dto.pagination.pageSize}
    `;
    const histories = await getAll<HistoryWithNo>(selectQuery, params, undefined, conn);

    return {
      histories,
      total,
    };
  } catch (error) {
    throw error;
  }
}
