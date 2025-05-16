import { insertRnSchoolDto, updateRnSchoolDto, deleteRnSchoolDto } from '@/interfaces/rn-school/rn-school.d';

import {
  existsRnSchoolByAdministrationCode,
  insertRnSchool,
  updateRnSchool as updateRnSchoolModel,
  deleteRnSchool as deleteRnSchoolModel,
} from '@/models/rn-school/rn-school.model';
import {
  logAction,
  makeInsertLogParams,
  makeUpdateLogParams,
  makeDeleteLogParams,
} from '@/services/log-action/log-action.service';

// LogMeta 타입 정의
export type LogMeta = {
  manager_no?: number;
  school_no?: number;
  ip?: string | null;
  user_agent?: string | null;
};

// 학교 등록: 행정표준코드로 중복 체크 후 등록
export async function createRnSchool(administrationcode: string, userInput: Partial<insertRnSchoolDto>, meta: LogMeta) {
  try {
    // 1. DB에서 행정표준코드로 중복 체크
    const exists = await existsRnSchoolByAdministrationCode(administrationcode);
    if (exists) throw new Error('이미 등록된 학교입니다.');

    // 2. 프론트에서 받은 값만으로 DB 저장
    const dto: Omit<insertRnSchoolDto, 'school_no'> = {
      sname: userInput.sname ?? '',
      scode: userInput.scode ?? '',
      area: userInput.area ?? '',
      administrationcode: administrationcode,
      modbus: userInput.modbus ?? 0,
      modbus_host: userInput.modbus_host ?? null,
      modbus_port: userInput.modbus_port ?? 502,
      use_os: userInput.use_os ?? 'N',
      parent_id: userInput.parent_id ?? null,
    };

    // 3. DB에 insert 및 school_no 반환
    const school_no = await insertRnSchool(dto as insertRnSchoolDto);

    // 4. 로그 기록
    await logAction(
      makeInsertLogParams({
        ...meta,
        school_no,
        action_type: 'I',
        target_table: 'rnschool',
        target_id: `${school_no}`,
        new_values: { ...dto, school_no },
        reason: '학교 등록',
      }),
    );

    return { type: 'insert', school: { ...dto, school_no } };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('학교 등록 중 오류가 발생했습니다.');
  }
}

// 학교 수정
export async function updateRnSchool(dto: updateRnSchoolDto, meta: LogMeta) {
  try {
    // 1. 기존 값 조회 (old_values)
    // 실제 구현에서는 DB에서 조회 필요. 예시로 oldDto = dto로 둠
    const oldDto = { ...dto };
    //  DB에서 학교 정보 업데이트
    await updateRnSchoolModel(dto);
    // 2. 로그 기록
    await logAction(
      makeUpdateLogParams({
        ...meta,
        action_type: 'U',
        target_table: 'rnschool',
        target_id: `${dto.school_no}`,
        old_values: oldDto,
        new_values: dto,
        reason: '학교 수정',
      }),
    );
    return { success: true };
  } catch (error) {
    throw error;
  }
}

// 학교 삭제
export async function deleteRnSchool(dto: deleteRnSchoolDto, meta: LogMeta) {
  try {
    // 1. 기존 값 조회 (old_values)
    // 실제 구현에서는 DB에서 조회 필요. 예시로 oldDto = dto로 둠
    const oldDto = { ...dto };
    //  DB에서 학교 정보 삭제
    await deleteRnSchoolModel(dto);
    // 2. 로그 기록
    await logAction(
      makeDeleteLogParams({
        ...meta,
        action_type: 'D',
        target_table: 'rnschool',
        target_id: `${dto.school_no}`,
        old_values: oldDto,
        reason: '학교 삭제',
      }),
    );
    return { success: true };
  } catch (error) {
    throw error;
  }
}
