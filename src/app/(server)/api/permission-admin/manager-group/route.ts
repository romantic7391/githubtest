import { NextRequest, NextResponse } from 'next/server';
import {
  createManagerGroupS,
  updateManagerGroupS,
  deleteManagerGroupS,
  getManagerGroupsS,
} from '@/services/permission-admin/manager-group.service';
import { getSession } from '@/lib/auth/session';
import { handleError, handleZodError } from '@/utils/error.utils';
import { paginationSchema } from '@/types/common';
import {
  createManagerGroupSchema,
  updateManagerGroupSchema,
  managerGroupSchema,
  managerGroupCreateOrUpdateApiResponseSchema,
  managerGroupListRequestSchema,
  managerGroupsApiResponseSchema,
} from '@/types/permission/manager-group';
import { getClientInfo } from '@/services/log-action/log-action.service';
import { AppError } from '@/utils/error.utils';
import { DEFAULT_PAGE_SIZE } from '@/lib/default.constant';

/**
 * 관리자 그룹 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
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
        },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE;
    const groupNo = searchParams.get('groupNo');
    const schoolNo = searchParams.get('schoolNo');

    // 페이지네이션 검증
    const pagination = paginationSchema.parse({ page, pageSize });

    // 필터 검증
    const filters = managerGroupListRequestSchema.parse({
      groupNo: groupNo ? Number(groupNo) : undefined,
      schoolNo: schoolNo ? Number(schoolNo) : undefined,
    });

    const result = await getManagerGroupsS(
      session.managerNo,
      pagination,
      {
        managerNo: session.managerNo,
        ip: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
        schoolNo: 0,
      },
      filters,
    );

    return NextResponse.json(
      managerGroupsApiResponseSchema.parse({
        success: true,
        message: '관리자 그룹 목록을 조회했습니다.',
        data: result,
      }),
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '관리자 그룹 목록 조회');
  }
}

/**
 * 관리자 그룹 생성
 */
export async function POST(request: NextRequest) {
  try {
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
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validatedData = createManagerGroupSchema.parse(body);

    // 서비스 함수에 전달할 데이터 변환
    const managerGroupData = managerGroupSchema.parse({
      ...validatedData,
      created: null,
    });

    const { userAgent, ip } = getClientInfo(request);
    const result = await createManagerGroupS(managerGroupData, {
      managerNo: session.managerNo,
      ip,
      userAgent: userAgent,
      schoolNo: 0,
    });

    return NextResponse.json(
      managerGroupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        message: '관리자 그룹이 성공적으로 생성되었습니다.',
        data: result,
      }),
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '관리자 그룹 생성');
  }
}

/**
 * 관리자 그룹 수정
 */
export async function PUT(request: NextRequest) {
  try {
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
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validatedData = updateManagerGroupSchema.parse(body);

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
        managerNo: session.managerNo,
        ip,
        userAgent: userAgent,
        schoolNo: 0,
      },
    );

    return NextResponse.json(
      managerGroupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        message: '관리자 그룹이 성공적으로 수정되었습니다.',
        data: result,
      }),
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '관리자 그룹 수정');
  }
}

/**
 * 관리자 그룹 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
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
        },
        { status: 401 },
      );
    }

    let no: string | null = null;
    let groupNo: string | null = null;

    // body에서 파라미터 확인
    try {
      const body = await request.json();
      no = body.no?.toString() || null;
      groupNo = body.groupNo?.toString() || null;
    } catch {
      // body가 없는 경우 query string에서 파라미터 확인
      const { searchParams } = new URL(request.url);
      no = searchParams.get('no');
      groupNo = searchParams.get('groupNo');
    }

    if (!no || !groupNo) {
      return NextResponse.json(
        {
          success: false,
          message: '관리자 번호와 그룹 번호는 필수입니다.',
        },
        { status: 400 },
      );
    }

    await deleteManagerGroupS(Number(no), Number(groupNo), {
      managerNo: session.managerNo,
      ip: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
      schoolNo: 0,
    });

    return NextResponse.json(
      managerGroupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        message: '관리자 그룹이 성공적으로 삭제되었습니다.',
        data: {
          groupNo: Number(groupNo),
          no: Number(no),
        },
      }),
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '관리자 그룹 삭제');
  }
}
