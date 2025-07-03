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
  school_no: number,
  meta: { manager_no: number; ip: string | null; user_agent: string | null },
) {
  let conn;
  try {
    conn = await beginTransaction();
    const school = await findSchoolBySchoolNo({ schoolNo: school_no });

    if (!school) {
      throw new AppError('학교를 찾을 수 없습니다.', 404);
    }

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        school_no: Number(school_no),
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'S',
        target_table: 'rnschool',
        target_id: `${school_no}`,
        old_values: JSON.stringify({}),
        new_values: JSON.stringify(school),
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
  meta: { manager_no: number; ip: string | null; user_agent: string | null },
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
        manager_no: meta.manager_no,
        school_no: Number(dto.schoolNo),
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'U',
        target_table: 'rnschool',
        target_id: `${dto.schoolNo}`,
        old_values: JSON.stringify(oldSchool),
        new_values: JSON.stringify(dto),
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
  meta: { manager_no: number; ip: string | null; user_agent: string | null },
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
        manager_no: meta.manager_no,
        school_no: Number(dto.schoolNo),
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'D',
        target_table: 'rnschool',
        target_id: `${dto.schoolNo}`,
        old_values: JSON.stringify(oldSchool),
        new_values: null,
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
