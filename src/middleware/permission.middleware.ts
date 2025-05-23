import { NextRequest, NextResponse } from 'next/server';
import { checkPermission } from '@/services/permission/permission.service';
import { getSession } from '@/lib/auth/session';

/**
 * 권한 체크 미들웨어
 */
export async function withPermission(req: NextRequest, permissionName: string, schoolNo?: number) {
  try {
    const session = await getSession(req);
    if (!session?.manager_no) {
      return NextResponse.json(
        {
          success: false,
          message: '로그인이 필요합니다.',
        },
        { status: 401 },
      );
    }

    const hasPermission = await checkPermission(session.manager_no, permissionName, schoolNo);

    if (!hasPermission) {
      return NextResponse.json(
        {
          success: false,
          message: '권한이 없습니다.',
        },
        { status: 403 },
      );
    }

    return null; // 권한이 있는 경우 null 반환하여 다음 미들웨어로 진행
  } catch (error) {
    console.error('[withPermission] 권한 체크 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: '권한 체크 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
