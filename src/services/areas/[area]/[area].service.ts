import { findAreaByArea, updateAreaInfo, deleteAreaFromDB, checkAreaExists } from '@/models/area/area.model';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import type { Area } from '@/types/area';
import type { LogMeta } from '@/types/history';

// 지역 조회
export async function getAreaByArea(area: string, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();
    const result = await findAreaByArea(area);

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'AreaData',
        targetId: area,
        oldValues: null,
        newValues: JSON.stringify(result[0]),
        reason: '지역 정보 조회',
      }),
      conn,
    );

    await commitTransaction(conn);
    return result;
  } catch (error) {
    if (conn) {
      try {
        await rollbackTransaction(conn);
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    console.error('[getAreaByAreaService] DB 조회 에러:', error);
    throw new Error('지역 목록 조회 중 오류가 발생했습니다.');
  }
}

// 지역 수정
export async function updateArea(dto: Area, meta: LogMeta): Promise<void> {
  let conn;
  try {
    conn = await beginTransaction();
    if (!dto.area) {
      throw new Error('지역명이 필요합니다.');
    }

    // 중복 검증 (자기 자신 제외)
    const exists = await checkAreaExists(dto.area);
    if (exists) {
      throw new Error('이미 존재하는 지역명입니다.');
    }

    // 이전 데이터 조회
    const oldData = await findAreaByArea(dto.area);

    // 데이터 수정
    await updateAreaInfo(dto, conn);

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'U',
        targetTable: 'AreaData',
        targetId: dto.area,
        oldValues: JSON.stringify(oldData),
        newValues: JSON.stringify(dto),
        reason: '지역 정보 수정',
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
    console.error('[updateAreaService] 지역 수정 중 오류:', error);
    throw error instanceof Error ? error : new Error('지역 수정 중 오류가 발생했습니다.');
  }
}

// 지역 삭제
export async function deleteArea(area: string, meta: LogMeta): Promise<void> {
  let conn;
  try {
    conn = await beginTransaction();
    // 이전 데이터 조회
    const oldData = await findAreaByArea(area);

    // 데이터 삭제
    await deleteAreaFromDB(area);

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'D',
        targetTable: 'AreaData',
        targetId: area,
        oldValues: JSON.stringify(oldData),
        newValues: null,
        reason: '지역 삭제',
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
    console.error('[deleteAreaService] 지역 삭제 중 오류:', error);
    throw new Error('지역 삭제 중 오류가 발생했습니다.');
  }
}
