import { existsRnSchoolByAdministrationCode, insertRnSchool } from '@/models/rn-school/rn-school.model';
import { logAction, makeLogParams } from '@/services/log-action/log-action.service';
import { SchoolCreate } from '@/types/school';
import { LogMeta } from '@/types/history';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { AppError } from '@/utils/error.utils';

// 학교 등록: 행정표준코드로 중복 체크 후 등록
export async function createRnSchool(administrationCode: string, userInput: Partial<SchoolCreate>, meta: LogMeta) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. DB에서 행정표준코드로 중복 체크
    const exists = await existsRnSchoolByAdministrationCode({ administrationCode });
    if (exists) {
      throw new AppError('이미 등록된 학교입니다.', 400);
    }

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

    // 3. DB에 insert 및 school_no 반환
    const school_no = await insertRnSchool(dto);

    // 4. 로그 기록
    await logAction(
      makeLogParams({
        manager_no: meta.manager_no,
        school_no,
        ip: meta.ip,
        user_agent: meta.user_agent,
        action_type: 'I',
        target_table: 'rnschool',
        target_id: `${school_no}`,
        old_values: null,
        new_values: JSON.stringify({ ...dto, school_no }),
        reason: '학교 등록',
      }),
      conn,
    );

    await commitTransaction(conn);
    return {
      type: 'insert',
      school: { ...dto, school_no },
    };
  } catch (error) {
    if (conn) {
      try {
        await rollbackTransaction(conn);
      } catch (rollbackError) {
        console.error('Rollback 실패:', rollbackError);
        // 다른 서비스들과 일관성을 위해 에러를 throw하지 않고 로깅만 함
      }
    }
    console.error('학교 등록 중 오류 발생:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('학교 등록 중 오류가 발생했습니다.', 500);
  } finally {
    if (conn) {
      try {
        await conn.release();
      } catch (err) {
        console.error('Connection release error:', err);
      }
    }
  }
}
