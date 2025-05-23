import { insertArea, checkAreaExists } from '@/models/area/area.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import type { AreaCreate } from '@/types/area';
import type { LogMeta } from '@/types/history';

/**
 * 지역 학교 추가
 */
// 지역 중복 검증
export async function existsAreaByAreaName(area: string): Promise<boolean> {
  return await checkAreaExists(area);
}

// 지역 생성
export async function createArea(dto: AreaCreate, meta: LogMeta): Promise<void> {
  const conn = await beginTransaction();
  try {
    // 중복 검증
    const exists = await checkAreaExists(dto.area);
    if (exists) {
      throw new Error('이미 존재하는 지역명입니다.');
    }

    await insertArea(dto);

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'I',
        target_table: 'AreaData',
        target_id: dto.area,
        old_values: null,
        new_values: JSON.stringify(dto),
        reason: '지역 생성',
      }),
      conn,
    );

    await commitTransaction(conn);
  } catch (error) {
    await rollbackTransaction(conn);
    console.error('[createAreaService] 지역 생성 중 오류:', error);
    throw error instanceof Error ? error : new Error('지역 생성 중 오류가 발생했습니다.');
  }
}
