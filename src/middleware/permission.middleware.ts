import { NextRequest, NextResponse } from 'next/server';
import { checkPermission } from '@/services/permission/permission.service';
import { getSession } from '@/lib/auth/session';

type ActionType = '조회' | '수정' | '삭제';

/**
 * 학교 관련 권한 체크 미들웨어
 */
export async function checkSchoolPermission(
  req: NextRequest,
  schoolNo: number,
  action: ActionType,
): Promise<NextResponse | null> {
  try {
    // 1. 세션 체크
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

    // 2. 권한 체크
    const permissionName = `학교_${action}`;
    console.log('권한 체크 파라미터:', {
      managerNo: session.manager_no,
      schoolNo,
      permissionName,
    });
    const { allowed } = await checkPermission(session.manager_no, schoolNo, permissionName);

    if (!allowed) {
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
    console.error('[checkSchoolPermission] 권한 체크 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: '권한 체크 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
