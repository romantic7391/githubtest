import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { Group, groupListRequestSchema, createGroupRequestSchema } from '@/types/permission';
// import {groupListApiResponseSchema, groupCreateApiResponseSchema } from '@/types/permission';

import { handleError, handleZodError } from '@/utils/error.utils';
import { getGroupsS, createGroupS } from '@/services/permission-admin/group.service';
import { AppError } from '@/utils/error.utils';
import { Pagination } from '@/types/common';

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

    // 요청 데이터 검증
    try {
      const validatedData = groupListRequestSchema.parse({
        page,
        pageSize,
        name,
        schoolNo: schoolNo === 'null' ? null : schoolNo ? Number(schoolNo) : undefined,
      });

      const pagination: Pagination = {
        page: validatedData.page,
        pageSize: validatedData.pageSize,
        total: 0,
        totalPages: 0,
      };

      const result = await getGroupsS(
        pagination,
        {
          manager_no: session.manager_no,
          ip: request.headers.get('x-forwarded-for') || '',
          user_agent: request.headers.get('user-agent') || '',
        },
        {
          name: validatedData.name,
          schoolNo: validatedData.schoolNo,
        },
      );

      return NextResponse.json(
        {
          success: true,
          message: '그룹 목록을 성공적으로 조회했습니다.',
          data: {
            groups: result.groups,
            pagination: result.pagination,
          },
        },
        { status: 200 },
      );
    } catch (validationError) {
      throw validationError;
    }
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

    try {
      const validatedData = createGroupRequestSchema.parse(body);

      const groupData: Omit<Group, 'group_no'> = {
        name: validatedData.name,
        school_no: validatedData.schoolNo,
        parent_group_no: validatedData.parentGroupNo,
      };

      const result = await createGroupS(groupData, {
        manager_no: session.manager_no,
        ip: request.headers.get('x-forwarded-for') || '',
        user_agent: request.headers.get('user-agent') || '',
      });

      return NextResponse.json(
        {
          success: true,
          message: '그룹이 성공적으로 생성되었습니다.',
          data: {
            groupNo: result.groupNo,
          },
        },
        { status: 201 },
      );
    } catch (validationError) {
      throw validationError;
    }
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
    return handleError(error, '그룹 생성');
  }
}
