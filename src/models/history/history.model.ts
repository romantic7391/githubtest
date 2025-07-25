import type { PoolConnection } from 'mariadb';
import type { HistoryWithNo, SelectHistoriesRequestDto } from '@/types/history';
import { getRow, getAll } from '@/lib/mariadb/query';

export async function selectHistories(dto: SelectHistoriesRequestDto, conn?: PoolConnection) {
  try {
    const offset = (dto.pagination.page - 1) * dto.pagination.pageSize;
    const conditions = ['1=1'];
    const joins: string[] = [];
    const params: (string | number)[] = [];

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
      WHERE ${conditions.join(' AND ')}
      ORDER BY h.log_no ${dto.filters.order?.toUpperCase()}
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
