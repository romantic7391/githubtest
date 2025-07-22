import type { History } from '@/types/history';
import type { ManagerSignUp } from '@/types/manager';
import type { PoolConnection } from 'mariadb';
import { auth } from '@/auth';
import { findManagerBySignInId, insertManager } from '@/models/manager/manager.model';
import { AppError } from '@/utils/error.utils';
import { headers } from 'next/headers';
import { insertLogAction } from '@/models/history-action/history-action.model';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import bcrypt from 'bcrypt';
import { findSchoolBySchoolNo } from '@/models/rn-school/rn-school.model';
import { insertGroup } from '@/models/group/group-model';
import { insertManagerGroup } from '@/models/manager-group/manager-group.model';

/**
 * 히스토리 로깅
 * @param history - 히스토리 정보
 * @param conn - 데이터베이스 연결
 */
async function logAction(history: Omit<History, 'ip' | 'userAgent' | 'managerNo' | 'schoolNo'>, conn?: PoolConnection) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || '';
  const userAgent = headersList.get('user-agent') || '';

  const session = await auth();
  const managerNo = session?.user?.managerNo ?? null;
  const schoolNo = session?.user?.schoolNo ?? null;

  await insertLogAction(
    {
      ...history,
      ip,
      userAgent,
      managerNo,
      schoolNo,
    },
    conn,
  );
}

/**
 * 아이디 중복 검사
 */
export async function checkDuplicate(signInId: string) {
  try {
    const result = await findManagerBySignInId(signInId);
    await logAction({
      actionType: 'S',
      targetTable: 'manager',
      targetId: signInId,
      oldValues: JSON.stringify(result),
      newValues: null,
      reason: '아이디 중복 검사',
    });
    return Boolean(result);
  } catch (error) {
    console.error(error);
    throw new AppError('아이디 중복 검사 중 오류가 발생했습니다.', 500);
  }
}

export async function signUp({ signInId, password, name, schoolNo, parentGroupNo }: ManagerSignUp) {
  let conn;
  try {
    conn = await beginTransaction();

    // 1. 아이디 중복 검사
    const isDuplicated = await findManagerBySignInId(signInId, conn);
    if (isDuplicated) {
      throw new AppError('이미 사용중인 아이디입니다.', 400);
    }

    // 2. 학교 존재 확인
    const isExistSchool = await findSchoolBySchoolNo({ schoolNo });
    if (!isExistSchool) {
      throw new AppError('학교를 찾을 수 없습니다.', 400);
    }

    // 3. 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. 관리자 생성
    const { insertId: managerNo } = await insertManager(
      {
        signInId,
        salt,
        hashedPassword,
        name,
        schoolNo: 0,
      },
      conn,
    );

    // 5. 관리자 아이디로 그룹 생성
    const { insertId: groupNo } = await insertGroup(
      {
        name: signInId,
        schoolNo: 0,
        parentGroupNo: parentGroupNo === undefined ? null : parentGroupNo,
      },
      conn,
    );

    // 6. 관리자 아이디 그룹에 관리자 추가
    await insertManagerGroup(
      {
        no: managerNo,
        groupNo,
      },
      conn,
    );

    // 7. 이력 저장
    await logAction(
      {
        actionType: 'I',
        targetTable: 'manager',
        targetId: managerNo.toString(),
        oldValues: null,
        newValues: JSON.stringify({ signInId, name, schoolNo: 0 }),
        reason: '관리자 생성',
      },
      conn,
    );

    // 8. 트랜잭션 커밋
    await commitTransaction(conn);
  } catch (error) {
    if (conn) {
      await rollbackTransaction(conn);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('회원가입 중 오류가 발생했습니다.', 500);
  }
}
