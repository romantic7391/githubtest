import type { BaseApiResponse } from '@/types/common';
import { NextRequest, NextResponse } from 'next/server';
import { createGroupS, updateGroupS, deleteGroupS, getGroupS } from '@/services/permission-admin/group.service';
import { getSession } from '@/lib/auth/session';
import { handleZodError, handleError } from '@/utils/error.utils';
import {
  createGroupSchema,
  updateGroupSchema,
  groupCreateOrUpdateApiResponseSchema,
  groupSchema,
} from '@/types/permission';

/**
 * 그룹 조회
 */
export async function GET(request: NextRequest, { params }: { params: { groupNo: string } }) {
  try {
    const { groupNo } = params;
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

    const result = await getGroupS(Number(groupNo), {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      groupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
        message: '그룹이 성공적으로 조회되었습니다.',
      }),
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, '그룹 조회');
  }
}

/**
 * 그룹 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createGroupSchema.parse(body);
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

    const groupData = groupSchema.parse({
      ...validatedData,
      group_no: 0,
      created: null,
    });

    const result = await createGroupS(groupData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      groupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
        message: '그룹이 성공적으로 생성되었습니다.',
      }),
      { status: 200 },
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '그룹 생성');
  }
}

/**
 * 그룹 수정
 */
export async function PUT(request: NextRequest, { params }: { params: { groupNo: string } }) {
  try {
    const { groupNo } = params;
    const body = await request.json();
    const validatedData = updateGroupSchema.parse(body);
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

    const groupData = groupSchema.parse({
      ...validatedData,
      group_no: Number(groupNo),
      created: null,
    });

    const result = await updateGroupS(groupData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      groupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
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
export async function DELETE(request: NextRequest, { params }: { params: { groupNo: string } }) {
  try {
    const { groupNo } = params;
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
