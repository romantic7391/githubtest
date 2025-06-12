import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  CreateGroup,
  groupListRequestSchema,
  groupListApiResponseSchema,
  groupCreateApiResponseSchema,
  createGroupRequestSchema,
} from '@/types/permission';

import { handleError, handleZodError } from '@/utils/error.utils';
import { getGroupsS, createGroupS } from '@/services/permission-admin/group.service';
import { AppError } from '@/utils/error.utils';
import { paginationSchema } from '@/types/common';

/**
 * 그룹 목록 조회
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
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const name = searchParams.get('name') || undefined;
    const schoolNo = searchParams.get('schoolNo');

    console.log('그룹 목록 조회 요청:', {
      page,
      pageSize,
      name,
      schoolNo,
      managerNo: session.manager_no,
    });

    // 페이지네이션 검증
    const pagination = paginationSchema.parse({ page, pageSize });

    // 필터 검증
    const filters = groupListRequestSchema.parse({
      name,
      schoolNo: schoolNo === 'null' ? null : schoolNo ? Number(schoolNo) : undefined,
    });

    const result = await getGroupsS(
      pagination,
      {
        manager_no: session.manager_no,
        ip: request.headers.get('x-forwarded-for') || '',
        user_agent: request.headers.get('user-agent') || '',
      },
      filters,
    );

    console.log('그룹 목록 조회 결과:', {
      total: result.pagination.total,
      totalPages: result.pagination.totalPages,
      items: result.groups.length,
    });

    return NextResponse.json(
      groupListApiResponseSchema.parse({
        success: true,
        data: result,
        message: '그룹 목록을 조회했습니다.',
      }),
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        { status: error.statusCode },
      );
    }
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '그룹 목록 조회');
  }
}

/**
 * 그룹 생성
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[POST] 그룹 생성 시작');

    // 개발 환경에서 테스트를 위해 헤더 설정
    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }

    const session = await getSession(request);
    console.log('[POST] session:', session);

    if (!session) {
      console.log('[POST] 세션 없음');
      return NextResponse.json(
        {
          success: false,
          message: '인증되지 않은 요청입니다.',
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    console.log('[POST] body:', body);

    const validatedData = createGroupRequestSchema.parse(body);
    console.log('[POST] validatedData:', validatedData);

    const groupData: CreateGroup = {
      name: validatedData.name,
      schoolNo: validatedData.schoolNo,
      parentGroupNo: validatedData.parentGroupNo,
    };
    console.log('[POST] groupData:', groupData);

    console.log('[POST] createGroupS 호출 전');
    const result = await createGroupS(groupData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });
    console.log('[POST] createGroupS 결과:', result);

    // 응답 데이터 검증
    const response = groupCreateApiResponseSchema.parse({
      success: true,
      data: result,
      message: '그룹이 성공적으로 생성되었습니다.',
    });
    console.log('[POST] response:', response);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[POST] 에러 발생:', error);
    if (error instanceof AppError) {
      console.error('[POST] AppError:', error.message, error.code);
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        { status: error.statusCode },
      );
    }
    const zodError = handleZodError(error);
    if (zodError) {
      console.error('[POST] ZodError:', zodError);
      return zodError;
    }
    return handleError(error, '그룹 생성');
  }
}
