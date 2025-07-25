import { LogMeta, SelectHistoriesRequestDto, selectHistoriesResponseDto } from '@/types/history';
import { selectHistories } from '@/models/history/history.model';
import { AppError } from '@/utils/error.utils';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { logAction, makeLogParams } from '../log-action/log-action.service';
import { paginationSchema } from '@/types/common';

export async function getHistoriesS(dto: SelectHistoriesRequestDto, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();
    let { histories, total } = await selectHistories(dto, conn);
    histories = selectHistoriesResponseDto.shape.data.shape.histories.parse(histories);
    total = selectHistoriesResponseDto.shape.data.shape.pagination.shape.total.parse(total);

    if (histories.length === 0) {
      throw new AppError('작업 이력 목록이 존재하지 않습니다.', 404);
    }

    await logAction(
      makeLogParams({
        ...meta,
        actionType: 'S',
        targetTable: 'history',
        targetId: null,
        oldValues: JSON.stringify({
          historyNos: histories.map((v) => v.historyNo),
        }),
        newValues: null,
        reason: '작업 이력 목록 조회',
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
    console.error('getHistoriesS: ', error);
    if (conn) {
      await rollbackTransaction(conn);
    }
    throw error;
  }
}
