import { NextRequest, NextResponse } from 'next/server';
import { checkPermissions } from '@/services/permission-check/permission-check.service';
import { permissionMappings } from '@/config/permission-mapping';
import { HTTPMethod } from '@/types/common';
import { findSchoolBySchoolNo } from '@/models/rn-school/rn-school.model';
import { getCommonContext } from '@/utils/context.utils';
import { AppError } from '@/utils/error.utils';
import { School } from '@/types/school';

/**
 * URL 패턴과 실제 URL을 매칭하여 파라미터를 추출
 */
function matchPath(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith('[') && patternParts[i].endsWith(']')) {
      const paramName = patternParts[i].slice(1, -1);
      params[paramName] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }

  return params;
}

/**
 * 관리자 여부 확인 헬퍼 함수
 */
function isAdmin(schoolNo: number): boolean {
  return schoolNo === 0;
}

/**
 * 권한 체크 함수
 * API 라우트에서 권한 체크를 수행합니다.
 */
export async function checkPermission(
  request: NextRequest,
  { params }: { params: Promise<{ schoolNo?: number | null; area?: string | null; permissionNo?: number }> },
): Promise<NextResponse | null> {
  try {
    // 1. 공통 컨텍스트 가져오기 (세션 포함)
    const commonContext = await getCommonContext(request);
    console.log('[checkPermission] commonContext:', {
      managerNo: commonContext.managerNo,
      schoolNo: commonContext.schoolNo,
      path: request.nextUrl.pathname,
      method: request.method,
    });

    const method = request.method as HTTPMethod;
    const path = request.nextUrl.pathname;

    // 2. 권한 매핑 찾기
    const mapping = permissionMappings.find((m) => m.method === method && matchPath(m.path, path));
    console.log('[checkPermission] mapping found:', mapping);
    if (!mapping) {
      console.log('[checkPermission] no mapping found for:', { method, path });
      return null;
    }

    // 관리자는 모든 권한 허용
    if (isAdmin(commonContext.schoolNo)) {
      console.log('[checkPermission] admin user - all permissions allowed');
      return null;
    }

    // 3. 지역 기반 접근 제어
    const resolvedParams = await params;
    let userSchool: School | null = null;

    if (resolvedParams.area) {
      userSchool = await findSchoolBySchoolNo({ schoolNo: commonContext.schoolNo });
      if (!userSchool) {
        return NextResponse.json({ success: false, message: '학교 정보를 찾을 수 없습니다.' }, { status: 404 });
      }

      if (userSchool.area !== resolvedParams.area) {
        return NextResponse.json(
          { success: false, message: `다른 지역의 학교 정보에 접근할 수 없습니다.` },
          { status: 403 },
        );
      }
    }

    // 4. 학교 계층 구조 체크 (삭제/수정 시)
    if (method === 'DELETE' || method === 'PUT') {
      const targetSchoolNo = resolvedParams.schoolNo;
      if (!targetSchoolNo) {
        return NextResponse.json({ success: false, message: '대상 학교 번호가 없습니다.' }, { status: 400 });
      }

      // userSchool이 아직 조회되지 않았다면 조회
      if (!userSchool) {
        userSchool = await findSchoolBySchoolNo({ schoolNo: commonContext.schoolNo });
      }

      if (!userSchool) {
        return NextResponse.json({ success: false, message: '사용자 학교 정보를 찾을 수 없습니다.' }, { status: 404 });
      }

      const targetSchool = await findSchoolBySchoolNo({ schoolNo: targetSchoolNo });
      if (!targetSchool) {
        return NextResponse.json({ success: false, message: '대상 학교 정보를 찾을 수 없습니다.' }, { status: 404 });
      }

      // 계층 구조 체크: 사용자 학교가 대상 학교의 상위인지 확인
      let currentSchool: School | null = targetSchool;
      let isAuthorized = false;

      while (currentSchool?.parentNo) {
        if (currentSchool.parentNo === userSchool.schoolNo) {
          isAuthorized = true;
          break;
        }
        currentSchool = await findSchoolBySchoolNo({ schoolNo: currentSchool.parentNo });
        if (!currentSchool) break;
      }

      // 자신의 학교는 직접 접근 가능
      if (targetSchoolNo === userSchool.schoolNo) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        return NextResponse.json({ success: false, message: '해당 학교에 대한 권한이 없습니다.' }, { status: 403 });
      }
    }

    // 5. 권한 체크
    console.log('[checkPermission] checking permissions:', {
      managerNo: commonContext.managerNo,
      schoolNo: commonContext.schoolNo,
      permissions: mapping.permissions,
    });

    const { allowed, override } = await checkPermissions(
      commonContext.managerNo,
      commonContext.schoolNo,
      mapping.permissions,
    );

    console.log('[checkPermission] permission result:', { allowed, override });

    if (allowed === 'N') {
      console.log('[checkPermission] permission denied');
      return NextResponse.json(
        {
          success: false,
          message: override ? '권한이 거부되었습니다. 관리자에게 문의하세요.' : '권한이 없습니다.',
        },
        { status: 403 },
      );
    }

    return null;
  } catch (error) {
    console.error('[checkPermission] 권한 체크 중 오류 발생:', error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('권한 체크 중 오류가 발생했습니다.', 500);
  }
}
