import { existsRnSchoolByAdministrationCode, insertRnSchool } from '@/models/rn-school/rn-school.model';
import { logAction, makeInsertLogParams } from '@/services/log-action/log-action.service';
import { SchoolCreate } from '@/types/school';
import { LogMeta } from '@/types/history';
import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';

// 학교 등록: 행정표준코드로 중복 체크 후 등록
export async function createRnSchool(administrationCode: string, userInput: Partial<SchoolCreate>, meta: LogMeta) {
  try {
    console.log('Creating school with:', { administrationCode, userInput, meta }); // 디버깅용 로그

    // 1. DB에서 행정표준코드로 중복 체크
    const exists = await existsRnSchoolByAdministrationCode(administrationCode);
    if (exists) throw new Error('이미 등록된 학교입니다.');

    // 2. 프론트에서 받은 값만으로 DB 저장
    const dto: Omit<SchoolCreate, 'school_no'> = {
      sname: (userInput as SchoolCreate).sname,
      scode: (userInput as SchoolCreate).scode,
      area: userInput.area || null,
      administrationCode: administrationCode,
      modbus: userInput.modbus || 0,
      modbusHost: userInput.modbusHost || null,
      modbusPort: userInput.modbusPort || 502,
      useOrderSheet: userInput.useOrderSheet || 'N',
      active: userInput.active || 'Y',
      parentNo: null,
    };

    console.log('DTO before DB conversion:', dto); // 디버깅용 로그

    // 3. DB에 insert 및 school_no 반환
    const school_no = await insertRnSchool(dto);

    // 4. 로그 기록
    const { manager_no, ...restMeta } = meta;
    const logParams = {
      ...restMeta,
      manager_no: manager_no || undefined,
      school_no,
      action_type: 'I' as const,
      target_table: 'rnschool',
      target_id: `${school_no}`,
      new_values: { ...dto, school_no },
      reason: '학교 등록',
    };

    await logAction(makeInsertLogParams(logParams));

    return {
      type: 'insert',
      school: { ...dto, school_no },
    };
  } catch (error: unknown) {
    console.error('Error in createRnSchool:', error); // 디버깅용 로그
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error(DEFAULT_ERROR_MESSAGE_500);
  }
}
