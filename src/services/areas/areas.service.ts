import { findAreas } from '@/models/area/area.model';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import type { LogMeta } from '@/types/history';

// 지역 조회
export async function getAreas(page: number = 1, limit: number = 10, areas: string[] = [], meta?: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();
    console.log('[getAreas] 호출, 파라미터:', { page, limit, areas });

    const result = await findAreas(page, limit, areas);

    // 히스토리 로그 기록
    if (meta) {
      await logAction(
        makeLogParams({
          ...meta,
          action_type: 'S',
          target_table: 'AreaData',
          target_id: result.areas.map((area) => area.area).join(',') || null,
          old_values: null,
          new_values: JSON.stringify({ data: result.areas }),
          reason: '지역 목록 조회',
        }),
        conn,
      );
    }

    await commitTransaction(conn);
    console.log('[getAreas] 결과:', { total: result.total, areasCount: result.areas.length });
    return result;
  } catch (error) {
    if (conn) await rollbackTransaction(conn);
    console.error('[getAreas] DB 조회 에러:', error);
    throw new Error('학교 목록 조회 중 오류가 발생했습니다.');
  }
}
