import {
  findSchoolBySchoolNo,
  updateRnSchool as updateRnSchoolModel,
  deleteRnSchool as deleteRnSchoolModel,
} from '@/models/rn-school/rn-school.model';

import { School } from '@/types/school';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';

// 학교 조회
export async function getSchoolBySchoolNo(school_no: number) {
  try {
    return await findSchoolBySchoolNo(school_no);
  } catch (error) {
    // 내부 에러 정보는 콘솔에만 남김
    console.error('[getSchoolBySchoolNoService] DB 조회 에러:', error);
    throw new Error('학교 조회 중 오류가 발생했습니다.');
  }
}

// 학교 수정
export async function updateRnSchool(
  dto: School,
  meta: { manager_no: number; ip: string | null; user_agent: string | null },
): Promise<void> {
  const conn = await beginTransaction();
  try {
    // 학교 존재 여부 확인
    const oldSchool = await findSchoolBySchoolNo(dto.schoolNo);

    // 학교 정보 수정
    await updateRnSchoolModel(dto, conn);

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        school_no: dto.schoolNo,
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
    await rollbackTransaction(conn);
    console.error('[updateRnSchoolService] 학교 수정 중 오류 발생:', error);
    throw new Error('학교 수정 중 오류가 발생했습니다.');
  }
}

// 학교 삭제
export async function deleteRnSchool(
  dto: School,
  meta: { manager_no: number; ip: string | null; user_agent: string | null },
) {
  const conn = await beginTransaction();
  try {
    // 학교 존재 여부 확인
    const oldSchool = await findSchoolBySchoolNo(dto.schoolNo);

    // 학교 삭제
    await deleteRnSchoolModel(dto.schoolNo, conn);

    // 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        school_no: dto.schoolNo,
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
    await rollbackTransaction(conn);
    console.error('[deleteRnSchoolService] 학교 삭제 중 오류 발생:', error);
    throw new Error('학교 삭제 중 오류가 발생했습니다.');
  }
}
