import type { BaseApiResponse } from '@/types/common';
import { NextRequest, NextResponse } from 'next/server';
import { updateGroupS, deleteGroupS } from '@/services/permission-admin/group.service';
import { getSession } from '@/lib/auth/session';
import { handleZodError, handleError } from '@/utils/error.utils';
import { updateGroupSchema, groupCreateOrUpdateApiResponseSchema, RouteParams } from '@/types/permission';

/**
 * 그룹 수정
 */
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { groupNo } = await context.params;
    const body = await request.json();
    const validatedData = updateGroupSchema.parse({
      ...body,
      groupNo: Number(groupNo),
    });
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

    await updateGroupS(
      Number(groupNo),
      {
        name: validatedData.name,
        schoolNo: validatedData.schoolNo,
        parentGroupNo: validatedData.parentGroupNo,
      },
      {
        manager_no: session.manager_no,
        ip: request.headers.get('x-forwarded-for') || '',
        user_agent: request.headers.get('user-agent') || '',
      },
    );

    return NextResponse.json(
      groupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: {
          groupNo: Number(groupNo),
        },
        message: '그룹이 성공적으로 수정되었습니다.',
      }),
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '그룹 수정');
  }
}

/**
 * 그룹 삭제
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { groupNo } = await context.params;
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

    await deleteGroupS(Number(groupNo), {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      {
        success: true,
        message: '그룹이 성공적으로 삭제되었습니다.',
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, '그룹 삭제');
  }
}
