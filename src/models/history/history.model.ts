import type { PoolConnection } from 'mariadb';
import type { HistoryWithNo, SelectHistoryDto } from '@/types/history';
import { AppError } from '@/utils/error.utils';
import { getRow, getAll } from '@/lib/mariadb/query';

const selectFromClause = `
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
  FROM history AS h
`;

export async function selectHistorys(dto: SelectHistoryDto, conn?: PoolConnection) {
  try {
    const offset = (dto.pagination.page - 1) * dto.pagination.pageSize;

    const conditions = ['1=1'];
    const joins: string[] = [];
    const params: (string | number)[] = [];

    if (dto.filters.schoolNo !== undefined) {
      conditions.push('h.school_no = ?');
      params.push(dto.filters.schoolNo);
    }

    if (dto.filters.managerNo !== undefined) {
      conditions.push('h.manager_no = ?');
      params.push(dto.filters.managerNo);
    }

    if (dto.filters.ip !== undefined) {
      conditions.push('h.ip = ?');
      params.push(dto.filters.ip);
    }

    if (dto.filters.userAgent !== undefined) {
      conditions.push('h.user_agent = ?');
      params.push(dto.filters.userAgent);
    }

    if (dto.filters.actionType !== undefined) {
      conditions.push('h.action_type = ?');
      params.push(dto.filters.actionType);
    }

    if (dto.filters.reason !== undefined) {
      conditions.push('h.reason = ?');
      params.push(dto.filters.reason);
    }

    if (dto.filters.startDate !== undefined) {
      conditions.push('h.created_at >= ?');
      params.push(dto.filters.startDate);
    }

    if (dto.filters.endDate !== undefined) {
      conditions.push('h.created_at <= ?');
      params.push(dto.filters.endDate);
    }

    if (dto.filters.area) {
      joins.push(`LEFT JOIN rnSchool AS s ON h.school_no = s.school_no`);
      conditions.push('s.area = ?');
      params.push(dto.filters.area);
    }

    if (dto.filters.groupNo) {
      joins.push(`LEFT JOIN managerGroup AS mg ON h.manager_no = mg.no`);
      joins.push(`LEFT JOIN \`group\` AS g ON mg.group_no = g.group_no`);
      joins.push(`LEFT JOIN \`group\` AS pg ON g.parent_group_no = pg.group_no`);
      conditions.push('(g.group_no = ? OR pg.group_no = ?)');
      params.push(dto.filters.groupNo);
      params.push(dto.filters.groupNo);
    }

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM history AS h
      ${joins.join('\n')}
      WHERE ${conditions.join(' AND ')}
    `;
    const totalResult = await getRow<{ total: number }>(countQuery, params, undefined, conn);
    const total = totalResult?.total || 0;

    const query = `
      ${selectFromClause}
      ${joins.join('\n')}
      WHERE ${conditions.join(' AND ')}
      ORDER BY h.log_no ${dto.filters.order?.toUpperCase()}
      LIMIT ${offset}, ${dto.pagination.pageSize}
    `;
    const historys = await getAll<HistoryWithNo>(query, params, undefined, conn);

    return {
      historys,
      total,
    };
  } catch {
    throw new AppError('이력 목록 조회 중 오류가 발생했습니다.', 500);
  }
}

export async function selectHistory(historyNo: number, conn?: PoolConnection) {
  try {
    const query = `
      ${selectFromClause}
      WHERE h.log_no = ?
    `;
    const history = await getRow<HistoryWithNo>(query, [historyNo], undefined, conn);
    return history;
  } catch {
    throw new AppError('이력 조회 중 오류가 발생했습니다.', 500);
  }
}
