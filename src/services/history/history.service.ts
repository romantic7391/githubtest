import { LogMeta, SelectHistoryDto } from '@/types/history';
import { selectHistory, selectHistorys } from '@/models/history/history.model';
import { AppError } from '@/utils/error.utils';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { logAction, makeLogParams } from '../log-action/log-action.service';
import { Pagination } from '@/types/common';

export async function getHistorysS(dto: SelectHistoryDto, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();
    const { historys, total } = await selectHistorys(dto, conn);

    if (historys.length === 0) {
      throw new AppError('이력 목록이 존재하지 않습니다.', 404);
    }

    await logAction(
      makeLogParams({
        ...meta,
        actionType: 'S',
        targetTable: 'history',
        targetId: null,
        oldValues: JSON.stringify(historys),
        newValues: null,
        reason: '이력 목록 조회',
      }),
      conn,
    );

    await commitTransaction(conn);
    return {
      historys,
      pagination: {
        ...dto.pagination,
        total,
        totalPages: Math.ceil(total / dto.pagination.pageSize),
      } satisfies Pagination,
    };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}

export async function getHistoryS(historyNo: number, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();
    const history = await selectHistory(historyNo, conn);

    if (!history) {
      throw new AppError('존재하지 않는 이력입니다.', 404);
    }

    await logAction(
      makeLogParams({
        ...meta,
        actionType: 'S',
        targetTable: 'history',
        targetId: historyNo.toString(),
        oldValues: JSON.stringify(history),
        newValues: null,
        reason: '이력 조회',
      }),
      conn,
    );

    await commitTransaction(conn);
    return history;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    console.error(error);
    throw new AppError('이력 조회 중 오류가 발생했습니다.', 500);
  }
}
