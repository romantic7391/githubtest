import { NextRequest, NextResponse } from 'next/server';
import {
  createManagerGroupS,
  updateManagerGroupS,
  deleteManagerGroupS,
} from '@/services/permission-admin/manager-group.service';
import { getSession } from '@/lib/auth/session';
import { handleZodError, handleError } from '@/utils/error.utils';
import {
  createManagerGroupSchema,
  updateManagerGroupSchema,
  managerGroupCreateOrUpdateApiResponseSchema,
  managerGroupSchema,
} from '@/types/permission';

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
        },
        { status: 401 },
      );
    }

    // 서비스 함수에 전달할 데이터 변환
    const managerGroupData = managerGroupSchema.parse({
      ...validatedData,
      created: null,
    });

    const result = await createManagerGroupS(managerGroupData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      managerGroupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
      }),
    );
  } catch (error) {
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
    const body = await request.json();
    const validatedData = updateManagerGroupSchema.parse(body);
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

    // 서비스 함수에 전달할 데이터 변환
    const managerGroupData = managerGroupSchema.parse({
      ...validatedData,
      created: null,
    });

    const result = await updateManagerGroupS(managerGroupData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      managerGroupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
      }),
    );
  } catch (error) {
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
    const { searchParams } = new URL(request.url);
    const groupNo = searchParams.get('group_no');

    if (!groupNo) {
      return NextResponse.json(
        {
          success: false,
          message: '그룹 번호는 필수입니다.',
        },
        { status: 400 },
      );
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

    const result = await deleteManagerGroupS(Number(groupNo), {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      managerGroupCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
      }),
    );
  } catch (error) {
    return handleError(error, '관리자 그룹 삭제');
  }
}
