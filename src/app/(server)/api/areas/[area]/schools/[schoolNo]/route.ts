import type { BaseApiResponse } from '@/types/common';
import type { SchoolApiResponse, SchoolCreateOrUpdateApiResponse, School, SchoolDto } from '@/types/school';
import type { CommonContext } from '@/types/permission';
import { NextRequest, NextResponse } from 'next/server';
import {
  getSchoolBySchoolNo,
  updateRnSchool,
  deleteRnSchool,
} from '@/services/areas/[area]/schools/[schoolNo]/[schoolNo].service';
import { getClientInfo } from '@/services/log-action/log-action.service';
import { checkPermissionMiddleware } from '@/middleware/permission.middleware';
import { handleError, handleZodError } from '@/utils/error.utils';
import { auth } from '@/auth';
import { Session } from 'next-auth';
/**
 * 공통 컨텍스트 정보 가져오기
 */
async function getCommonContext(request: NextRequest): Promise<CommonContext> {
  let session = await auth();
  if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
    session = {
      ...session,
      user: {
        ...session?.user,
        managerNo: 1,
      },
    } as Session;
  }
  if (!session?.user.managerNo) {
    throw new Error('로그인이 필요합니다.');
  }
  const { userAgent, ip } = getClientInfo(request);

  return {
    manager_no: session.user.managerNo,
    ip: ip || '',
    user_agent: userAgent || '',
  };
}

/**
 * 지역 학교 정보
 */
export async function GET(request: NextRequest, { params }: { params: Promise<SchoolDto> }) {
  try {
    const resolvedParams = await params;
    const schoolNoNum = Number(resolvedParams.schoolNo);

    // 테스트를 위해 권한 체크 주석 처리
    const permissionError = await checkPermissionMiddleware(request, {
      params: Promise.resolve({ schoolNo: schoolNoNum, area: resolvedParams.area }),
    });

    if (permissionError) return permissionError;

    const context = await getCommonContext(request);
    const school = await getSchoolBySchoolNo(schoolNoNum, context);

    if (!school) {
      return NextResponse.json(
        {
          success: false,
          message: '학교를 찾을 수 없습니다.',
        } satisfies BaseApiResponse,
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: '학교 정보를 성공적으로 조회했습니다.',
        data: school,
      } satisfies SchoolApiResponse,
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, 'GET');
  }
}

/**
 * 지역 학교 수정
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<SchoolDto> }) {
  try {
    const resolvedParams = await params;

    // 권한 체크

    const schoolNoNum = Number(resolvedParams.schoolNo);
    const body = await request.json();
    const dto: School = {
      ...body,
      schoolNo: schoolNoNum,
    };

    const context = await getCommonContext(request);
    await updateRnSchool(dto, context);

    return NextResponse.json(
      {
        success: true,
        message: '학교 정보가 성공적으로 수정되었습니다.',
        data: {
          schoolNo: schoolNoNum,
        },
      } satisfies SchoolCreateOrUpdateApiResponse,
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, 'PUT');
  }
}

/**
 * 지역 학교 삭제
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<SchoolDto> }) {
  try {
    const resolvedParams = await params;

    const schoolNoNum = Number(resolvedParams.schoolNo);
    const dto: School = {
      schoolNo: schoolNoNum,
    } as School;

    const context = await getCommonContext(request);
    await deleteRnSchool(dto, context);

    return NextResponse.json(
      {
        success: true,
        message: '학교가 성공적으로 삭제되었습니다.',
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, 'DELETE');
  }
}
