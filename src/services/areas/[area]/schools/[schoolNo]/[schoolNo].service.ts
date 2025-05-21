import {
  findSchoolBySchoolNo,
  updateRnSchool as updateRnSchoolModel,
  deleteRnSchool as deleteRnSchoolModel,
} from '@/models/rn-school/rn-school.model';

import { School } from '@/types/school';

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
export async function updateRnSchool(dto: School): Promise<void> {
  try {
    // 학교 존재 여부 확인
    await findSchoolBySchoolNo(dto.schoolNo);

    // 학교 정보 수정
    await updateRnSchoolModel(dto);
  } catch (error) {
    console.error('[updateRnSchoolService] 학교 수정 중 오류 발생:', error);
    throw new Error('학교 수정 중 오류가 발생했습니다.');
  }
}

// 학교 삭제
export async function deleteRnSchool(dto: School) {
  try {
    // 학교 존재 여부 확인
    await findSchoolBySchoolNo(dto.schoolNo);

    // 학교 삭제
    await deleteRnSchoolModel(dto.schoolNo);
  } catch (error) {
    console.error('[deleteRnSchoolService] 학교 삭제 중 오류 발생:', error);
    throw new Error('학교 삭제 중 오류가 발생했습니다.');
  }
}
