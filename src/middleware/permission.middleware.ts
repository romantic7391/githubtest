/* eslint-disable */
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { checkPermission, checkPermissions } from '@/services/permission/permission.service';
import { getSession } from '@/lib/auth/session';
import { permissionMappings } from '@/config/permission-mapping';
import { HTTPMethod } from '@/types/common';

/**
 * URL 패턴과 실제 URL을 매칭하여 파라미터를 추출
 */
function matchPath(pattern: string, path: string): Record<string, string> | null {
  console.log('매칭 시도:', { pattern, path });

  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  console.log('분리된 패턴:', patternParts);
  console.log('분리된 경로:', pathParts);

  if (patternParts.length !== pathParts.length) {
    console.log('길이 불일치');
    return null;
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith('[') && patternParts[i].endsWith(']')) {
      const paramName = patternParts[i].slice(1, -1);
      params[paramName] = pathParts[i];
      console.log('파라미터 매칭:', { paramName, value: pathParts[i] });
    } else if (patternParts[i] !== pathParts[i]) {
      console.log('일치하지 않는 부분:', { pattern: patternParts[i], path: pathParts[i] });
      return null;
    }
  }

  console.log('최종 매칭 결과:', params);
  return params;
}

/**
 * 권한 체크 미들웨어
 */
export async function checkPermissionMiddleware(
  request: NextRequest,
  { params }: { params: Promise<{ schoolNo: number; area: string | null }> },
): Promise<NextResponse | null> {
  try {
    // 1. 세션 체크
    const session = await getSession(request);
    if (!session?.manager_no) {
      return NextResponse.json(
        {
          success: false,
          message: '로그인이 필요합니다.',
        },
        { status: 401 },
      );
    }

    const method = request.method as HTTPMethod;
    const path = request.nextUrl.pathname;
    console.log('권한 체크 요청:', { method, path });

    // 2. 권한 매핑 찾기
    const mapping = permissionMappings.find((m) => m.method === method && matchPath(m.path, path));

    if (!mapping) {
      console.log('권한 매핑을 찾을 수 없음');
      // 권한 매핑이 없는 경우 (권한 체크가 필요없는 엔드포인트)
      return null;
    }

    console.log('찾은 권한 매핑:', mapping);

    // 3. URL 파라미터에서 schoolNo 추출
    let schoolNo = 0;
    if (mapping.params?.schoolNo) {
      const pathParams = matchPath(mapping.path, path);
      console.log('경로 파라미터:', pathParams);
      if (pathParams && mapping.params.schoolNo in pathParams) {
        schoolNo = Number(pathParams[mapping.params.schoolNo]);
        console.log('설정된 schoolNo:', schoolNo);
      }
    }

    // 4. 권한 체크
    const { allowed, override } = await checkPermissions(session.manager_no, schoolNo, mapping.permissions);

    if (allowed === 'N') {
      console.log('권한 없음:', { allowed, override });
      return NextResponse.json(
        {
          success: false,
          message: override
            ? '상위 그룹에서 권한이 거부되었지만, 하위 그룹에서 오버라이드되었습니다. 관리자에게 문의하세요.'
            : '권한이 없습니다.',
        },
        { status: 403 },
      );
    }

    return null; // 권한이 있는 경우 null 반환하여 다음 미들웨어로 진행
  } catch (error) {
    console.error('[checkPermissionMiddleware] 권한 체크 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: '권한 체크 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
