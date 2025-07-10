import { insertArea, checkAreaExists } from '@/models/area/area.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import type { AreaCreate } from '@/types/area';
import type { LogMeta } from '@/types/history';
import { AppError } from '@/utils/error.utils';

/**
 * 지역 학교 추가
 */
// 지역 중복 검증
export async function existsAreaByAreaName(area: string): Promise<boolean> {
  return await checkAreaExists(area);
}

// 지역 생성
export async function createArea(dto: AreaCreate, meta: LogMeta): Promise<void> {
  let conn;
  try {
    conn = await beginTransaction();
    // 중복 검증
    const exists = await checkAreaExists(dto.area);
    if (exists) {
      throw new AppError('이미 존재하는 지역명입니다.', 409);
    }

    await insertArea(dto);

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'I',
        targetTable: 'AreaData',
        targetId: dto.area,
        oldValues: null,
        newValues: JSON.stringify(dto),
        reason: '지역 생성',
      }),
      conn,
    );

    await commitTransaction(conn);
  } catch (error) {
    if (conn) {
      try {
        await rollbackTransaction(conn);
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }

    if (error instanceof AppError) throw error;
    throw new AppError('지역 생성 중 오류가 발생했습니다.', 500);
  }
}
