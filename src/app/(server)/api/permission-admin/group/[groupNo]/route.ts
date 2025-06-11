// import type { BaseApiResponse } from '@/types/common';
import { NextRequest, NextResponse } from 'next/server';
import { updateGroupS, deleteGroupS } from '@/services/permission-admin/group.service';
import { getSession } from '@/lib/auth/session';
import { handleZodError, handleError } from '@/utils/error.utils';
import {
  Group,
  GroupRouteParams,
  groupUpdateRequestSchema,
  groupCreateOrUpdateApiResponseSchema,
  groupDeleteApiResponseSchema,
} from '@/types/permission';
// import {updateGroupSchema,groupCreateOrUpdateApiResponseSchema ,RouteParams} from '@/types/permission'
import { AppError } from '@/utils/error.utils';

/**
 * 그룹 수정
 */
export async function PUT(request: NextRequest, context: GroupRouteParams) {
  try {
    const { groupNo } = await context.params;
    const groupNoNum = Number(groupNo);
    const body = await request.json();

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

    // 요청 데이터 검증
    const validatedData = groupUpdateRequestSchema.parse(body);

    const groupData: Group = {
      group_no: groupNoNum,
      name: validatedData.name,
      school_no: validatedData.schoolNo,
      parent_group_no: validatedData.parentGroupNo,
      school_name: null,
      parent_group_name: null,
    };

    const result = await updateGroupS(groupData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    // 응답 데이터 검증
    return NextResponse.json(
      groupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
        message: '그룹이 성공적으로 수정되었습니다.',
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
    return handleError(error, '그룹 수정');
  }
}

/**
 * 그룹 삭제
 */
export async function DELETE(request: NextRequest, context: GroupRouteParams) {
  try {
    const { groupNo } = await context.params;
    const groupNoNum = Number(groupNo);

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

    await deleteGroupS(groupNoNum, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      groupDeleteApiResponseSchema.parse({
        success: true,
        data: { groupNo: groupNoNum },
        message: '그룹이 성공적으로 삭제되었습니다.',
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
    return handleError(error, '그룹 삭제');
  }
}
