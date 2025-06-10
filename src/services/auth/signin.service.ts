import { InvalidCredentialsError, UserNotFoundError } from '@/lib/credential.error';
import { beginTransaction, commitTransaction, rollbackTransaction } from '@/lib/mariadb/query';
import { findManagerBySignInId, findManagerWithPasswordBySignInId } from '@/models/manager/manager.model';
import { UserWithPassword } from '@/types/next-auth';
import bcrypt from 'bcrypt';
import { CredentialsSignin } from 'next-auth';

export async function authenticateUser(signInId: string, password: string) {
  const conn = await beginTransaction();

  try {
    // 1. 사용자 조회
    const manager = await findManagerWithPasswordBySignInId(signInId, conn);

    // 2. 사용자 존재 여부 확인. 사용자가 없으면 에러 발생.
    if (!manager) {
      throw new UserNotFoundError();
    }

    // 3. 계정 잠금 상태 확인.

    // 4. 비밀번호 검증.
    const isPasswordValid = await validatePassword(password, manager.hashedPassword);

    // 5. 비밀번호 불일치 처리.
    if (!isPasswordValid) {
      // 5.1. 로그인 시도 횟수 증가.

      // 5.2. 계정 잠금 여부 결정.

      // 5.3. 로그인 시도 횟수를 DB에 업데이트.

      throw new InvalidCredentialsError();
    }

    // 6. 계정 승인 상태 확인.

    // 7. 로그인 성공. 로그인 시도 횟수 초기화.

    // 8. 사용자 데이터 반환.
    const result = await findManagerBySignInId(signInId);
    await commitTransaction(conn);
    return result;
  } catch (error) {
    console.error(error);
    await rollbackTransaction(conn);
    if (error instanceof CredentialsSignin) {
      throw error;
    }
    throw error;
  }
}

/**
 * 비밀번호를 검증합니다.
 * @param inputPassword 입력 비밀번호
 * @param targetPassword 대상 비밀번호
 * @returns {Promise<boolean>} 검증 결과
 */
export async function validatePassword(
  inputPassword: string,
  targetPassword: UserWithPassword['hashedPassword'],
): Promise<boolean> {
  const isMatch = await bcrypt.compare(inputPassword, targetPassword);
  return isMatch;
}
