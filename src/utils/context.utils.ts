import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { AppError } from '@/utils/error.utils';

/**
 * 공통 컨텍스트 정보 가져오기
 * 세션 정보와 클라이언트 정보를 포함한 공통 컨텍스트를 반환합니다.
 */
export async function getCommonContext(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    throw new AppError('로그인이 필요합니다.', 401);
  }

  if (session.user.schoolNo === undefined || session.user.schoolNo === null) {
    throw new AppError('사용자 학교 정보가 없습니다.', 401);
  }

  return {
    managerNo: session.user.managerNo,
    schoolNo: session.user.schoolNo,
    ip: request.headers.get('x-forwarded-for') || '',
    userAgent: request.headers.get('user-agent') || '',
  };
}
