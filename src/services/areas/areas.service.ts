import { findAreas } from '@/models/area/area.model';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import type { LogMeta } from '@/types/history';
import { AppError } from '@/utils/error.utils';

// 지역 조회
export async function getAreas(page: number = 1, limit: number = 10, areas: string[] = [], meta?: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    const result = await findAreas(page, limit, areas);

    // 지역 필터가 제공되었는데 결과가 없는 경우에만 에러
    if (areas && areas.length > 0 && !result?.areas?.length) {
      throw new AppError(`요청하신 지역을 찾을 수 없습니다.`, 404);
    }

    // 히스토리 로그 기록
    if (meta) {
      await logAction(
        makeLogParams({
          ...meta,
          actionType: 'S',
          targetTable: 'AreaData',
          targetId: result.areas.map((area) => area.area).join(',') || null,
          oldValues: JSON.stringify({ data: result.areas }),
          newValues: null,
          reason: '지역 목록 조회',
        }),
        conn,
      );
    }

    await commitTransaction(conn);
    return result;
  } catch (error) {
    if (conn) await rollbackTransaction(conn);

    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('지역 목록 조회 중 오류가 발생했습니다.', 500);
  }
}
