import {
  findSchoolBySchoolNo,
  updateRnSchool as updateRnSchoolModel,
  deleteRnSchool as deleteRnSchoolModel,
} from '@/models/rn-school/rn-school.model';

import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { updateRnSchoolDto, deleteRnSchoolDto } from '@/types/school';
import { AppError } from '@/utils/error.utils';

// 학교 조회
export async function getSchoolBySchoolNo(
  schoolNo: number,
  meta: { managerNo: number; ip: string | null; userAgent: string | null },
) {
  let conn;
  try {
    conn = await beginTransaction();
    const school = await findSchoolBySchoolNo({ schoolNo: schoolNo });

    if (!school) {
      throw new AppError('학교를 찾을 수 없습니다.', 404);
    }

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: Number(schoolNo),
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'S',
        targetTable: 'rnschool',
        targetId: `${schoolNo}`,
        oldValues: JSON.stringify(school),
        newValues: null,
        reason: '학교 정보 조회',
      }),
      conn,
    );

    await commitTransaction(conn);
    return school;
  } catch (error) {
    if (conn) await rollbackTransaction(conn);
    console.error('[getSchoolBySchoolNoService] DB 조회 에러:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('학교 정보 조회 중 오류가 발생했습니다.', 500);
  }
}

// 학교 수정
export async function updateRnSchool(
  dto: updateRnSchoolDto,
  meta: { managerNo: number; ip: string | null; userAgent: string | null },
): Promise<void> {
  let conn;
  try {
    conn = await beginTransaction();
    // 학교 존재 여부 확인
    const oldSchool = await findSchoolBySchoolNo({ schoolNo: dto.schoolNo });
    if (!oldSchool) {
      throw new AppError('수정할 학교를 찾을 수 없습니다.', 404);
    }

    // 학교 정보 수정
    await updateRnSchoolModel(dto, conn);

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: Number(dto.schoolNo),
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'U',
        targetTable: 'rnschool',
        targetId: `${dto.schoolNo}`,
        oldValues: JSON.stringify(oldSchool),
        newValues: JSON.stringify(dto),
        reason: '학교 정보 수정',
      }),
      conn,
    );

    await commitTransaction(conn);
  } catch (error) {
    if (conn) await rollbackTransaction(conn);
    console.error('[updateRnSchoolService] 학교 수정 중 오류 발생:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('학교 정보 수정 중 오류가 발생했습니다.', 500);
  }
}

// 학교 삭제
export async function deleteRnSchool(
  dto: deleteRnSchoolDto,
  meta: { managerNo: number; ip: string | null; userAgent: string | null },
) {
  let conn;
  try {
    conn = await beginTransaction();
    // 학교 존재 여부 확인
    const oldSchool = await findSchoolBySchoolNo({ schoolNo: dto.schoolNo });
    if (!oldSchool) {
      throw new AppError('삭제할 학교를 찾을 수 없습니다.', 404);
    }

    // 학교 삭제
    await deleteRnSchoolModel(dto, conn);

    // 로그 기록
    await logAction(
      makeLogParams({
        managerNo: meta.managerNo,
        schoolNo: Number(dto.schoolNo),
        ip: meta.ip,
        userAgent: meta.userAgent,
        actionType: 'D',
        targetTable: 'rnschool',
        targetId: `${dto.schoolNo}`,
        oldValues: JSON.stringify(oldSchool),
        newValues: null,
        reason: '학교 삭제',
      }),
      conn,
    );

    await commitTransaction(conn);
  } catch (error) {
    if (conn) await rollbackTransaction(conn);
    console.error('[deleteRnSchoolService] 학교 삭제 중 오류 발생:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('학교 삭제 중 오류가 발생했습니다.', 500);
  }
}
