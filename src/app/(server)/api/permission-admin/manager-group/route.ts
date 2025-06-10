import { NextRequest, NextResponse } from 'next/server';
import {
  createManagerGroupS,
  updateManagerGroupS,
  deleteManagerGroupS,
  getManagerGroupsS,
} from '@/services/permission-admin/manager-group.service';
import { getSession } from '@/lib/auth/session';
import { DEFAULT_ERROR_MESSAGE_500 } from '@/lib/default.constant';
import type { BaseApiResponse } from '@/types/common';
import { paginationSchema } from '@/types/common';
import {
  createManagerGroupSchema,
  updateManagerGroupSchema,
  managerGroupSchema,
  managerGroupCreateOrUpdateApiResponseSchema,
} from '@/types/permission';
import { getClientInfo } from '@/services/log-action/log-action.service';

/**
 * 관리자 그룹 목록 조회
 */
export async function GET(request: NextRequest, { params }: { params: { managerNo: string } }) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        } satisfies BaseApiResponse,
        { status: 401 },
      );
    }

    const managerNo = Number(params.managerNo);
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const groupNo = searchParams.get('groupNo');

    const pagination = paginationSchema.parse({
      page,
      pageSize,
    });

    const filters = groupNo ? { groupNo: Number(groupNo) } : undefined;

    const result = await getManagerGroupsS(managerNo, pagination, filters);
    return NextResponse.json(
      {
        success: true,
        message: '관리자 그룹 목록을 성공적으로 조회했습니다.',
        data: result,
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error('[GET] 관리자 그룹 목록 조회 에러:', error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
        errors: [error instanceof Error ? error.message : String(error)],
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

/**
 * 관리자 그룹 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createManagerGroupSchema.parse(body);
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        } satisfies BaseApiResponse,
        { status: 401 },
      );
    }
    // 개발 환경에서 테스트를 위해 헤더 설정
    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }

    // 서비스 함수에 전달할 데이터 변환
    const managerGroupData = managerGroupSchema.parse({
      ...validatedData,
      created: null,
    });

    const { userAgent, ip } = getClientInfo(request);
    const result = await createManagerGroupS(managerGroupData, {
      manager_no: session.manager_no,
      ip,
      user_agent: userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        message: '관리자 그룹이 성공적으로 생성되었습니다.',
        data: result,
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error('[POST] 관리자 그룹 생성 에러:', error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
        errors: [error instanceof Error ? error.message : String(error)],
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

/**
 * 관리자 그룹 수정
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateManagerGroupSchema.parse(body);

    // 개발 환경에서 테스트를 위해 헤더 설정
    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }

    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        } satisfies BaseApiResponse,
        { status: 401 },
      );
    }

    // 서비스 함수에 전달할 데이터 변환
    const managerGroupData = managerGroupSchema.parse({
      no: validatedData.no,
      groupNo: validatedData.groupNo,
      created: null,
    });

    const { userAgent, ip } = getClientInfo(request);
    const result = await updateManagerGroupS(
      managerGroupData,
      validatedData.originalNo,
      validatedData.originalGroupNo,
      {
        manager_no: session.manager_no,
        ip,
        user_agent: userAgent,
      },
    );

    const responseData = managerGroupCreateOrUpdateApiResponseSchema.shape.data.parse(result);

    return NextResponse.json(
      {
        success: true,
        message: '관리자 그룹이 성공적으로 수정되었습니다.',
        data: responseData,
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error('[PUT] 관리자 그룹 수정 에러:', error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
        errors: [error instanceof Error ? error.message : String(error)],
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}

/**
 * 관리자 그룹 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = managerGroupSchema.parse(body);

    // 개발 환경에서 테스트를 위해 헤더 설정
    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }

    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        } satisfies BaseApiResponse,
        { status: 401 },
      );
    }

    const { userAgent, ip } = getClientInfo(request);
    await deleteManagerGroupS(validatedData.no, validatedData.groupNo, {
      manager_no: session.manager_no,
      ip,
      user_agent: userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        message: '관리자 그룹이 성공적으로 삭제되었습니다.',
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error('[DELETE] 관리자 그룹 삭제 에러:', error);
    return NextResponse.json(
      {
        success: false,
        message: DEFAULT_ERROR_MESSAGE_500,
        errors: [error instanceof Error ? error.message : String(error)],
      } satisfies BaseApiResponse,
      { status: 500 },
    );
  }
}
