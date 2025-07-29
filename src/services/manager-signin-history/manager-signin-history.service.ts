import {
  SelectSignInHistoriesRequestDto,
  selectSignInHistoriesResponseDto,
  selectSignInHistoryResponseDto,
} from '@/types/manager-signin-history';
import { LogMeta } from '@/types/history';
import {
  selectSignInHistories,
  selectSignInHistory,
} from '@/models/manager-signin-history/manager-signin-history.model';
import { AppError } from '@/utils/error.utils';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { logAction, makeLogParams } from '../log-action/log-action.service';
import { paginationSchema } from '@/types/common';

export async function getSignInHistoriesS(dto: SelectSignInHistoriesRequestDto, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();
    let { histories, total } = await selectSignInHistories(dto, conn);
    histories = selectSignInHistoriesResponseDto.shape.data.shape.histories.parse(histories);
    total = selectSignInHistoriesResponseDto.shape.data.shape.pagination.shape.total.parse(total);

    if (histories.length === 0) {
      throw new AppError('로그인 이력 목록이 존재하지 않습니다.', 404);
    }

    await logAction(
      makeLogParams({
        ...meta,
        actionType: 'S',
        targetTable: 'manager_login_history',
        targetId: null,
        oldValues: JSON.stringify({
          historyNos: histories.map((v) => v.historyNo),
        }),
        newValues: null,
        reason: '로그인 이력 목록 조회',
      }),
      conn,
    );

    await commitTransaction(conn);
    return {
      histories,
      pagination: paginationSchema.parse({
        page: dto.pagination.page,
        pageSize: dto.pagination.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / dto.pagination.pageSize)),
      }),
    };
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}

export async function getSignInHistoryS(historyNo: number, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();
    const history = await selectSignInHistory(historyNo, conn);

    if (!history) {
      throw new AppError('로그인 이력을 찾을 수 없습니다.', 404);
    }

    const parsedHistory = selectSignInHistoryResponseDto.shape.data.parse(history);

    await logAction(
      makeLogParams({
        ...meta,
        actionType: 'S',
        targetTable: 'manager_login_history',
        targetId: historyNo.toString(),
        oldValues: JSON.stringify(parsedHistory),
        newValues: null,
        reason: '로그인 이력 상세 조회',
      }),
      conn,
    );

    await commitTransaction(conn);
    return parsedHistory;
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}
