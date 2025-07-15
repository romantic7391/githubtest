import { NextRequest } from 'next/server';
import { z } from 'zod';
import { User } from '@/types/next-auth';
import { auth } from '@/auth';

const SessionSchema = z.object({
  managerNo: z.number(),
  loginId: z.string(),
  name: z.string(),
});

type Session = z.infer<typeof SessionSchema>;

/**
 * 세션에서 사용자 정보 가져오기
 */
export async function getSession(req: NextRequest): Promise<Session | null> {
  try {
    // 테스트를 위해 헤더에서 manager_no를 가져옴
    const managerNo = req.headers.get('x-manager-no');
    if (!managerNo) {
      return null;
    }

    // 테스트를 위해 하드코딩된 값을 반환
    const session = {
      managerNo: Number(managerNo),
      loginId: `test${managerNo}`,
      name: `테스트${managerNo}`,
    };

    // Zod로 세션 데이터 검증
    return SessionSchema.parse(session);
  } catch (error) {
    console.error('[getSession] 세션 조회 중 오류 발생:', error);
    return null;
  }
}

/**
 * 미들웨어에서 설정한 개발용 세션 정보를 가져오기
 */
export function getDevSession(req: NextRequest) {
  try {
    const devSessionHeader = req.headers.get('x-dev-session');
    if (!devSessionHeader) {
      return null;
    }

    // base64로 인코딩된 헤더를 디코딩
    const decodedSession = Buffer.from(devSessionHeader, 'base64').toString('utf-8');
    const devUser: User = JSON.parse(decodedSession);
    return {
      user: devUser,
    };
  } catch (error) {
    console.error('[getDevSession] 개발 세션 조회 중 오류 발생:', error);
    return null;
  }
}

/**
 * 개발 환경에서 세션을 자동으로 주입하는 함수
 */
export async function getSessionWithDevFallback() {
  let session = await auth();

  // 개발 환경에서 세션이 없으면 테스트 세션 주입
  if (!session && process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
    session = {
      user: {
        managerNo: Number(process.env.DEV_MANAGER_NO) || 1,
        schoolNo: Number(process.env.DEV_SCHOOL_NO) || 0,
        signInId: 'test',
        name: '테스트',
      },
      expires: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }

  return session;
}
