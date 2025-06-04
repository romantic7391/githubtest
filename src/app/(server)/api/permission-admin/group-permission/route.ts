import { NextRequest, NextResponse } from 'next/server';
import {
  createGroupPermissionS,
  updateGroupPermissionS,
  deleteGroupPermissionS,
} from '@/services/permission-admin/group-permission.service';
import { getSession } from '@/lib/auth/session';
import { handleZodError, handleError } from '@/utils/error.utils';
import {
  createGroupPermissionSchema,
  updateGroupPermissionSchema,
  groupPermissionCreateOrUpdateApiResponseSchema,
  groupPermissionSchema,
} from '@/types/permission';

/**
 * 그룹 권한 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createGroupPermissionSchema.parse(body);
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
    const groupPermissionData = groupPermissionSchema.parse({
      ...validatedData,
      created: null,
    });

    const result = await createGroupPermissionS(groupPermissionData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      groupPermissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
      }),
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '그룹 권한 생성');
  }
}

/**
 * 그룹 권한 수정
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateGroupPermissionSchema.parse(body);
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
    const groupPermissionData = groupPermissionSchema.parse({
      ...validatedData,
      created: null,
    });

    const result = await updateGroupPermissionS(groupPermissionData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      groupPermissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
      }),
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '그룹 권한 수정');
  }
}

/**
 * 그룹 권한 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupNo = searchParams.get('group_no');
    const permissionNo = searchParams.get('permission_no');

    if (!groupNo || !permissionNo) {
      return NextResponse.json(
        {
          success: false,
          message: '그룹 번호와 권한 번호는 필수입니다.',
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

    const result = await deleteGroupPermissionS(Number(groupNo), Number(permissionNo), {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      groupPermissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
      }),
    );
  } catch (error) {
    return handleError(error, '그룹 권한 삭제');
  }
}
