import type { BaseApiResponse } from '@/types/common';
import { NextRequest, NextResponse } from 'next/server';
import { createGroupS, getGroupsS } from '@/services/permission-admin/group.service';
import { getSession } from '@/lib/auth/session';
import { handleZodError, handleError } from '@/utils/error.utils';
import { createGroupSchema, groupCreateOrUpdateApiResponseSchema, groupSchema } from '@/types/permission';
import { paginationSchema } from '@/types/common';

/**
 * 그룹 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
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
    const schoolNo = searchParams.get('schoolNo') ? Number(searchParams.get('schoolNo')) : undefined;

    const pagination = paginationSchema.parse({
      page,
      pageSize,
    });

    const filters = {
      name,
      schoolNo,
    };

    const result = await getGroupsS(pagination, filters);

    return NextResponse.json(
      {
        success: true,
        message: '그룹 목록을 조회했습니다.',
        data: result,
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, '그룹 목록 조회');
  }
}

/**
 * 그룹 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const validatedData = createGroupSchema.parse(body);
    console.log('Validated data:', validatedData);

    if (process.env.WORKING_ON_BACKEND_DEVELOPMENT === '1') {
      request.headers.set('x-manager-no', '1');
    }
    const session = await getSession(request);
    console.log('Session:', session);

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
    console.log('Group data:', groupData);

    const result = await createGroupS(groupData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });
    console.log('Create result:', result);

    return NextResponse.json(
      groupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: {
          group_no: result.insertId,
        },
        message: '그룹이 성공적으로 생성되었습니다.',
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error('Error in POST /api/permission-admin/group:', error);
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '그룹 생성');
  }
}
