import { NextRequest } from 'next/server';
import { z } from 'zod';

const SessionSchema = z.object({
  manager_no: z.number(),
  login_id: z.string(),
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
      manager_no: Number(managerNo),
      login_id: `test${managerNo}`,
      name: `테스트${managerNo}`,
    };

    // Zod로 세션 데이터 검증
    return SessionSchema.parse(session);
  } catch (error) {
    console.error('[getSession] 세션 조회 중 오류 발생:', error);
    return null;
  }
}
