import { findAreaByArea, updateAreaInfo, deleteAreaFromDB, checkAreaExists } from '@/models/area/area.model';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import type { Area } from '@/types/area';
import type { LogMeta } from '@/types/history';
import { AppError } from '@/utils/error.utils';

// 지역 조회
export async function getAreaByArea(area: string, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();
    const result = await findAreaByArea(area);

    // 지역이 존재하지 않는 경우 404 에러
    if (!result?.length) {
      throw new AppError('존재하지 않는 지역입니다.', 404);
    }

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: meta.schoolNo, // 사용자의 schoolNo 사용
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'AreaData',
        targetId: area,
        oldValues: JSON.stringify(result[0]),
        newValues: null,
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
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('지역 목록 조회 중 오류가 발생했습니다.', 500);
  }
}

// 지역 수정
export async function updateArea(dto: Area, meta: LogMeta, originalArea?: string): Promise<void> {
  let conn;
  try {
    conn = await beginTransaction();
    if (!dto.area) {
      throw new AppError('지역명이 필요합니다.', 400);
    }

    // 기존 area 값이 제공된 경우 (URL에서 가져온 값)
    const targetArea = originalArea || dto.area;

    // 이전 데이터 조회 (기존 area로 조회)
    const oldData = await findAreaByArea(targetArea);
    if (!oldData?.length) {
      throw new AppError('수정할 지역이 존재하지 않습니다.', 404);
    }

    // area 값이 변경되는 경우에만 중복 검증
    if (dto.area !== targetArea) {
      const exists = await checkAreaExists(dto.area);
      if (exists) {
        throw new AppError('이미 존재하는 지역명입니다.', 409);
      }
    }

    // 데이터 수정 (기존 area로 WHERE 조건 설정)
    await updateAreaInfo(dto, conn, targetArea);

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: meta.schoolNo, // 사용자의 schoolNo 사용
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'U',
        targetTable: 'AreaData',
        targetId: targetArea,
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
    if (error instanceof AppError) throw error;
    throw new AppError('지역 수정 중 오류가 발생했습니다.', 500);
  }
}

// 지역 삭제
export async function deleteArea(area: string, meta: LogMeta): Promise<void> {
  let conn;
  try {
    conn = await beginTransaction();
    // 이전 데이터 조회
    const oldData = await findAreaByArea(area);

    // 지역이 존재하지 않는 경우 404 에러
    if (!oldData?.length) {
      throw new AppError('삭제할 지역이 존재하지 않습니다.', 404);
    }

    // 데이터 삭제
    await deleteAreaFromDB(area);

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: meta.schoolNo, // 사용자의 schoolNo 사용
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
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('지역 삭제 중 오류가 발생했습니다.', 500);
  }
}
