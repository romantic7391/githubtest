import { NextRequest, NextResponse } from 'next/server';
import {
  createPermissionS,
  updatePermissionS,
  deletePermissionS,
} from '@/services/permission-admin/permission.service';
import { getSession } from '@/lib/auth/session';
import { handleZodError, handleError } from '@/utils/error.utils';
import {
  createPermissionSchema,
  updatePermissionSchema,
  permissionCreateOrUpdateApiResponseSchema,
  permissionSchema,
} from '@/types/permission';

/**
 * 권한 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPermissionSchema.parse(body);
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
    const permissionData = permissionSchema.parse({
      ...validatedData,
      permission_no: 0, // 임시 값, DB에서 자동 생성됨
      created: null,
    });

    const result = await createPermissionS(permissionData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      permissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
      }),
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '권한 생성');
  }
}

/**
 * 권한 수정
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updatePermissionSchema.parse(body);
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
    const permissionData = permissionSchema.parse({
      ...validatedData,
      created: null,
    });

    const result = await updatePermissionS(permissionData, {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      permissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
      }),
    );
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '권한 수정');
  }
}

/**
 * 권한 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const permissionNo = searchParams.get('permission_no');

    if (!permissionNo) {
      return NextResponse.json(
        {
          success: false,
          message: '권한 번호는 필수입니다.',
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

    const result = await deletePermissionS(Number(permissionNo), {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      permissionCreateOrUpdateApiResponseSchema.parse({
        success: true,
        data: result,
      }),
    );
  } catch (error) {
    return handleError(error, '권한 삭제');
  }
}
