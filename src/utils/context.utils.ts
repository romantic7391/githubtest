import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { AppError } from '@/utils/error.utils';
import { commonContextSchema } from '@/types/api-wrapper';

/**
 * 공통 컨텍스트 정보 가져오기
 * 세션 정보와 클라이언트 정보를 포함한 공통 컨텍스트를 반환합니다.
 */
export async function getCommonContext(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    throw new AppError('로그인이 필요합니다.', 401);
  }

  const context = {
    managerNo: session.user.managerNo,
    schoolNo: session.user.schoolNo,
    ip: request.headers.get('x-forwarded-for') || '',
    userAgent: request.headers.get('user-agent') || '',
  };

  // Zod로 런타임 검증
  return commonContextSchema.parse(context);
}
