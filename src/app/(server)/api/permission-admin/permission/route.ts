import { NextRequest, NextResponse } from 'next/server';
import {
  createPermissionS,
  updatePermissionS,
  deletePermissionS,
  findPermissionsS,
} from '@/services/permission-admin/permission.service';
import { getSession } from '@/lib/auth/session';
import { handleZodError, handleError } from '@/utils/error.utils';
import {
  createPermissionSchema,
  updatePermissionSchema,
  permissionCreateOrUpdateApiResponseSchema,
  permissionSchema,
} from '@/types/permission';
import { BaseApiResponse, paginationSchema } from '@/types/common';

/**
 * 권한 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validatedData = paginationSchema.parse({
      page: Number(searchParams.get('page') || '1'),
      pageSize: Number(searchParams.get('pageSize') || '10'),
      total: 0,
      totalPages: 1,
    });
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

    const result = await findPermissionsS(
      validatedData,
      {
        manager_no: session.manager_no,
        ip: request.headers.get('x-forwarded-for') || '',
        user_agent: request.headers.get('user-agent') || '',
      },
      {
        name: searchParams.get('name') || undefined,
      },
    );

    return NextResponse.json({
      success: true,
      message: '권한 목록을 성공적으로 조회했습니다.',
      data: result,
    } satisfies BaseApiResponse);
  } catch (error) {
    const zodError = handleZodError(error);
    if (zodError) return zodError;
    return handleError(error, '권한 목록 조회');
  }
}

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
        message: '권한이 성공적으로 수정되었습니다.',
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

    await deletePermissionS(Number(permissionNo), {
      manager_no: session.manager_no,
      ip: request.headers.get('x-forwarded-for') || '',
      user_agent: request.headers.get('user-agent') || '',
    });

    return NextResponse.json(
      {
        success: true,
        message: '권한이 성공적으로 삭제되었습니다.',
      } satisfies BaseApiResponse,
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, '권한 삭제');
  }
}
