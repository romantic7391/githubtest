/* eslint-disable */
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { checkPermission, checkPermissions } from '@/services/permission-check/permission.service';
import { permissionMappings } from '@/config/permission-mapping';
import { HTTPMethod } from '@/types/common';
import { getSchoolBySchoolNo } from '@/services/areas/[area]/schools/[schoolNo]/[schoolNo].service';
import { getCommonContext } from '@/utils/context.utils';

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
    console.log('공통 컨텍스트:', commonContext);

    const method = request.method as HTTPMethod;
    const path = request.nextUrl.pathname;

    // 2. 권한 매핑 찾기
    const mapping = permissionMappings.find((m) => m.method === method && matchPath(m.path, path));
    if (!mapping) return null;

    // 3. 지역 기반 접근 제어 (가장 먼저 체크)
    const resolvedParams = await params;
    if (resolvedParams.area) {
      // 관리자는 지역 제한 없음
      if (commonContext.schoolNo !== 0) {
        // 사용자의 학교 정보 조회
        console.log('getSchoolBySchoolNo 호출 전 파라미터:', {
          schoolNo: commonContext.schoolNo,
          meta: {
            managerNo: commonContext.managerNo,
            ip: commonContext.ip,
            userAgent: commonContext.userAgent,
          },
        });

        const userSchool = await getSchoolBySchoolNo(commonContext.schoolNo, {
          managerNo: commonContext.managerNo,
          ip: commonContext.ip,
          userAgent: commonContext.userAgent,
        });

        if (!userSchool) {
          return NextResponse.json({ success: false, message: '학교 정보를 찾을 수 없습니다.' }, { status: 404 });
        }

        // URL의 지역과 사용자의 학교 지역 비교
        if (userSchool.area !== resolvedParams.area) {
          return NextResponse.json(
            { success: false, message: `다른 지역의 학교 정보에 접근할 수 없습니다.` },
            { status: 403 },
          );
        }
      } else {
        console.log('관리자 권한으로 지역 제한 없음');
      }
    }

    // 4. 학교 계층 구조 체크 (삭제/수정 시)
    if (method === 'DELETE' || method === 'PUT') {
      const targetSchoolNo = resolvedParams.schoolNo;

      // 관리자(schoolNo 0)는 모든 학교에 접근 가능
      if (commonContext.schoolNo === 0) {
        console.log('관리자 권한으로 모든 학교 접근 가능');
      } else {
        // 일반 사용자는 자신의 학교와 하위 학교만 접근 가능
        const userSchool = await getSchoolBySchoolNo(commonContext.schoolNo, {
          managerNo: commonContext.managerNo,
          ip: commonContext.ip,
          userAgent: commonContext.userAgent,
        });

        if (!userSchool) {
          return NextResponse.json(
            { success: false, message: '사용자 학교 정보를 찾을 수 없습니다.' },
            { status: 404 },
          );
        }

        // 대상 학교가 사용자 학교의 하위인지 확인
        const targetSchool = await getSchoolBySchoolNo(targetSchoolNo, {
          managerNo: commonContext.managerNo,
          ip: commonContext.ip,
          userAgent: commonContext.userAgent,
        });

        if (!targetSchool) {
          return NextResponse.json({ success: false, message: '대상 학교 정보를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 계층 구조 체크: 사용자 학교가 대상 학교의 상위인지 확인
        let currentSchool = targetSchool;
        let isAuthorized = false;

        while (currentSchool.parentNo) {
          if (currentSchool.parentNo === userSchool.schoolNo) {
            isAuthorized = true;
            break;
          }
          currentSchool = await getSchoolBySchoolNo(currentSchool.parentNo, {
            managerNo: commonContext.managerNo,
            ip: commonContext.ip,
            userAgent: commonContext.userAgent,
          });
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
    }

    // 4. 권한 체크
    const { allowed, override } = await checkPermissions(
      commonContext.managerNo,
      commonContext.schoolNo,
      mapping.permissions,
    );

    if (allowed === 'N') {
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

    // AppError인 경우 적절한 상태 코드로 처리
    if (error instanceof Error && 'statusCode' in error) {
      const appError = error as any;
      return NextResponse.json(
        { success: false, message: appError.message || '오류가 발생했습니다.' },
        { status: appError.statusCode || 500 },
      );
    }

    return NextResponse.json({ success: false, message: '권한 체크 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
