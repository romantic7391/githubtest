import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import type { BaseApiResponse } from '@/types/common';
import type { SchoolApiResponse, SchoolCreateOrUpdateApiResponse, School } from '@/types/school';
import { NextRequest, NextResponse } from 'next/server';
import {
  getSchoolBySchoolNo,
  updateRnSchool,
  deleteRnSchool,
} from '@/services/areas/[area]/schools/[schoolNo]/[schoolNo].service';
import { getClientInfo } from '@/services/log-action/log-action.service';
import { checkSchoolPermission } from '@/services/permission/check-permission.service';
import { getSession } from '@/lib/auth/session';

/**
 * 지역 학교 정보
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ area: string; schoolNo: string }> }) {
  try {
    const { schoolNo } = await params;

    // 권한 체크
    const permissionCheck = await checkSchoolPermission(request, Number(schoolNo), '조회');
    if (permissionCheck) return permissionCheck;

    const session = await getSession(request);
    if (!session?.manager_no) {
      return NextResponse.json(
        {
          success: false,
          message: '로그인이 필요합니다.',
        } satisfies BaseApiResponse,
        { status: 401 },
      );
    }

    const { userAgent, ip } = getClientInfo(request);
    const school = await getSchoolBySchoolNo(Number(schoolNo), {
      manager_no: session.manager_no,
      ip,
      user_agent: userAgent,
    });

    if (!school) {
      return NextResponse.json({
        success: false,
        message: '학교를 찾을 수 없습니다.',
      } satisfies BaseApiResponse);
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
    console.error('[GET] 학교 조회 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

/**
 * 지역 학교 수정
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ area: string; schoolNo: string }> }) {
  try {
    const { schoolNo } = await params;

    // 권한 체크
    const permissionCheck = await checkSchoolPermission(request, Number(schoolNo), '수정');
    if (permissionCheck) return permissionCheck;

    const session = await getSession(request);
    if (!session?.manager_no) {
      return NextResponse.json(
        {
          success: false,
          message: '로그인이 필요합니다.',
        } satisfies BaseApiResponse,
        { status: 401 },
      );
    }

    const body = await request.json();
    const dto: School = {
      ...body,
      schoolNo: Number(schoolNo),
    };

    const { userAgent, ip } = getClientInfo(request);
    await updateRnSchool(dto, {
      manager_no: session.manager_no,
      ip,
      user_agent: userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        message: '학교 정보가 성공적으로 수정되었습니다.',
        data: {
          schoolNo: Number(schoolNo),
        },
      } satisfies SchoolCreateOrUpdateApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error('[PUT] 학교 수정 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

/**
 * 지역 학교 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ area: string; schoolNo: string }> },
) {
  try {
    const { schoolNo } = await params;

    // 권한 체크
    const permissionCheck = await checkSchoolPermission(request, Number(schoolNo), '삭제');
    if (permissionCheck) return permissionCheck;

    const session = await getSession(request);
    if (!session?.manager_no) {
      return NextResponse.json(
        {
          success: false,
          message: '로그인이 필요합니다.',
        } satisfies BaseApiResponse,
        { status: 401 },
      );
    }

    const dto: School = {
      schoolNo: Number(schoolNo),
    } as School;

    const { userAgent, ip } = getClientInfo(request);
    await deleteRnSchool(dto, {
      manager_no: session.manager_no,
      ip,
      user_agent: userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        message: '학교가 성공적으로 삭제되었습니다.',
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error('[DELETE] 학교 삭제 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}
